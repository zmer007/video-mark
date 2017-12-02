const ipc = require('electron').ipcRenderer
const $ = require('jquery')
var utils = require('./utils')
var marks = require('./mark')

const MARGIN = utils.vh(2);
const RECT_MARGIN = utils.vh(1);
const BLOCK_TIME = 1;
const BLOCK_SITE = 2;

var video = null

var cnt = 0

var currentBlock = null;
var middleCtrl = null;

var blockBound, blockX, blockY;
var blockOriginWith, blockOriginHeight;

// 时间控制器
var onLeftCtrl, onRightCtrl, onMiddleCtrl;
var ctrlLeftDelta, ctrlRightDelta;

// 位置控制器
var onRightEdge, onBottomEdge;
var onResizing;
var rectLeftDelta, rectTopDelta;

// 当前操作的是哪个控制器：BLOCK_TIME 为时间控制器，BLOCK_SITE 为位置控制器
var whichBlock = 0;

var progressBar = null;
var progressBarRect = null;

var mobileScreen = null;
var mobileScreenRect = null;

var downX;
var event;

var ctrlID = 0;

var redraw = false;

var action = null;

$(() => {

	progressBar = $('.progress-bar');
	progressBarRect = progressBar[0].getBoundingClientRect();

	mobileScreen = $('.rectangle-container');
	mobileScreenRect = mobileScreen[0].getBoundingClientRect();

	progressBar.on('mousedown', onDown);
	$(document).on('mousemove', onMove);
	$(document).on('mouseup', onUp);

	progressBar.on('touchdown', onTouchDown);
	$(document).on('touchmove', onTouchMove);
	$(document).on('touchen', onTouchEnd);


	$('#export').click(() => {
		// ipc.send('save-file', data.getData())
		console.log(progressBarRect)
		console.log(JSON.stringify(marks.getMarks()));
	});

	$(window).resize(() => {
		marks.reset();

		var children = $('.controller-container').children(`.ctrl`);
		for (var i = 0; i < children.length; i++) {
			children[i].remove();
		}
	})
})

ipc.on('file-saved', (event, path) => {
	console.log(path)
})

function onTouchDown(e) {
	onDown(e.touches[0]);
	e.preventDefault();
}

function onTouchMove(e) {
	onMove(e.touches[0])
}

function onTouchEnd(e) {
	if (e.touches.length == 0) onUp(e.changedTouches[0]);
}

function onMove(ee) {
	calc(ee);
	event = ee;
	redraw = true;
}

function onUp(e) {
	currentBlock = null;
	action = null;
}

animate();

function animate() {
	requestAnimationFrame(animate);
	if (!redraw) return;
	redraw = false;

	if (!currentBlock) return;

	if (onLeftCtrl) {
		var currentWidth = Math.max(downX - event.clientX + blockOriginWith, utils.vh(4));
		if (currentWidth >= utils.vh(4)) {
			middleCtrl.style.left = '0px';
			currentBlock.style.width = currentWidth + 'px';
			currentBlock.style.left = event.clientX + ctrlLeftDelta + 'px';
			var spanStart = event.clientX + ctrlLeftDelta + utils.vh(2)
			marks.getActivedMark().span.start = spanStart;
			marks.getActivedMark().span.loopStart = spanStart
			updateVideo(spanStart);
		}
	}

	if (onRightCtrl) {
		currentBlock.style.width = Math.max(blockX + ctrlRightDelta, utils.vh(4)) + 'px';
		var spanEnd = event.clientX - utils.vh(2) + ctrlRightDelta;;
		marks.getActivedMark().span.end = spanEnd;
		updateVideo(spanEnd);
	}

	if (onMiddleCtrl) {
		middleCtrl.style.left = blockX - utils.vh(2) + 'px';
		marks.getActivedMark().span.loopStart = event.clientX;
		updateVideo(event.clientX);
	}

	if (action && action.isResizing) {
		var minHW = utils.vh(10);
		if (action.onRightEdge) {
			currentBlock.style.width = Math.max(blockX, minHW) + 'px';
		}

		if (action.onBottomEdge) {
			currentBlock.style.height = Math.max(blockY, minHW) + 'px';
		}
	}

	if (action && action.isMoving) {
		currentBlock.style.top = (event.clientY - action.y) + 'px';
		currentBlock.style.left = (event.clientX - action.x) + 'px';
	}
}

function onDown(e) {
	if (e.target === progressBar[0]) {
		addController(ctrlID++, e.pageX);
		video = $(".palyer")[0];
	}
}

function addController(id, pageX) {
	$('.controller-container').append(`<div id='ctrl-${id}' class='ctrl'></div>`)
	var ctrl = $(`#ctrl-${id}`)
	ctrl.append(`<div class='middle'></div>`)
	ctrl.append(`<div class='left'></div>`)
	ctrl.find('.left').append(`<div class='triangle'></div>`)
	ctrl.find('.left').append(`<div class='line'></div>`)
	ctrl.append(`<div class='right'></div>`)
	ctrl.find('.right').append(`<div class='triangle'></div>`)
	ctrl.find('.right').append(`<div class='line'></div>`)
	ctrl.css("left", pageX - utils.vh(2))

	var rect = addRect(id);

	ctrl.dblclick(() => {
		ctrl.remove();
		rect.remove();
		marks.remove(id);
	})

	ctrl.on('mousedown', (e) => {
		whichBlock = BLOCK_TIME;
		currentBlock = e.target;
		marks.setActivemark(id);
		middleCtrl = ctrl.find('.middle')[0];
		downX = e.clientX;

		calc(e);
		redraw = true;
		blockOriginWith = blockBound.width;
		ctrlLeftDelta = blockBound.left - e.clientX;
		ctrlRightDelta = blockBound.right - e.clientX;

		e.preventDefault();
	})

	rect.on(`mousedown`, (e) => {
		whichBlock = BLOCK_SITE;
		currentBlock = e.target;
		downX = e.clientX;

		setAction(e);

		e.preventDefault();
	})

	marks.add(id);
}

function addRect(id) {
	mobileScreen.append(`<div id='rect-${id}' class='rectangle'></div>`);
	var rect = $(`#rect-${id}`);
	rect.append(`<input type='checkbox' class='checkbox-left'></input>`);
	rect.append(`<input type='checkbox' class='checkbox-top'></input>`);
	rect.append(`<input type='checkbox' class='checkbox-right'></input>`);
	rect.append(`<input type='checkbox' class='checkbox-bottom'></input>`);
	rect.append(`<input type='checkbox' class='checkbox-center'></input>`);
	return rect;
}

function setAction(e) {
	calc(e);

	var isResizing = onRightEdge || onBottomEdge;

	action = {
		x: mobileScreenRect.left + blockX,
		y: mobileScreenRect.top + blockY,
		cx: e.clientX,
		cy: e.clientY,
		w: blockBound.width,
		h: blockBound.height,
		isResizing: isResizing,
		isMoving: !isResizing && canMove(),
		onRightEdge: onRightEdge,
		onBottomEdge: onBottomEdge
	}
}

function canMove() {
	return blockX > 0 && blockX < blockBound.width && blockY > 0 && blockY < blockBound.height;
}

function calc(e) {
	if (!currentBlock) return;

	blockBound = currentBlock.getBoundingClientRect();
	blockX = e.clientX - blockBound.left;
	blockY = e.clientY - blockBound.top;

	if (whichBlock == BLOCK_TIME) {
		onLeftCtrl = blockX < MARGIN;
		onRightCtrl = blockX > blockBound.width - MARGIN;
		onMiddleCtrl = MARGIN < blockX && blockX < blockBound.width - MARGIN;
	} else if (whichBlock == BLOCK_SITE) {
		onRightEdge = blockX >= blockBound.width - RECT_MARGIN;
		onBottomEdge = blockY >= blockBound.height - RECT_MARGIN;
	}
}

function updateVideo(progressBarX) {
	if (currentBlock && progressBarRect && video) {
		video.currentTime = space2time(progressBarX, progressBarRect, video.duration);
	}
}

/**
 * 将进度条横轴的某点currentX转换成某段时间的时间点
 * @param {pageX} pageX 当前所在空间点
 * @param {间距} clientRect 控件BoundingClientRect
 * @param {时间总长度} duration  时间总长度
 */
function space2time(pageX, clientRect, duration) {
	var start = clientRect.left
	var end = clientRect.right
	if (pageX < start) {
		return 0;
	} else if (pageX > end) {
		return duration;
	} else {
		return (pageX - start) / (end - start) * duration;
	}
}