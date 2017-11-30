const ipc = require('electron').ipcRenderer
const $ = require('jquery')

var video = null

var marks = []
var cnt = 0

var currentBlock = null,
    middleCtrl = null;
var blockBound, blockX, blockY;
var blockOriginWith;
var onLeftCtrl, onRightCtrl, onMiddleCtrl;
var deltaLeft, deltaRight;
var downX;

var progressBar = null;
var progressBarRect = null;
var e;

var ctrlID = 0;
var currentMark = null;

var redraw = false;

var MARGIN = vh(2);

$(() => {

    progressBar = $('.progress-bar');
    progressBarRect = progressBar[0].getBoundingClientRect();
    console.log(progressBarRect);

    progressBar.on('mousedown', onDown);
    $(document).on('mousemove', onMove);
    $(document).on('mouseup', onUp);

    progressBar.on('touchdown', onTouchDown);
    $(document).on('touchmove', onTouchMove);
    $(document).on('touchen', onTouchEnd);


    $('#export').click(() => {
        // ipc.send('save-file', marks)
        console.log(JSON.stringify(marks));
    });

    $(window).resize(() => {
        marks = [];

        var children = $('.controller-container').children(`.ctrl`);
        for (var i=0; i<children.length; i++) {
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
    clac(ee);
    e = ee;
    redraw = true;
}

function onUp(e) {
    currentBlock = null;
}

animate();

function animate() {
    requestAnimationFrame(animate);
    if (!redraw) return;
    redraw = false;

    if (!currentBlock) return;

    if (onLeftCtrl) {
        var currentWidth = Math.max(downX - e.clientX + blockOriginWith, vh(4));
        if (currentWidth >= vh(4)) {
            middleCtrl.style.left = '0px';
            currentBlock.style.width = currentWidth + 'px';
            currentBlock.style.left = e.clientX + deltaLeft + 'px';
            var spanStart = e.clientX + deltaLeft + vh(2)
            currentMark.span.start = spanStart;
            currentMark.span.loopStart = spanStart
            updateVideo(spanStart);
        }
    }

    if (onRightCtrl) {
        currentBlock.style.width = Math.max(blockX + deltaRight, vh(4)) + 'px';
        var spanEnd = e.clientX - vh(2) + deltaRight;;
        currentMark.span.end = spanEnd;
        updateVideo(spanEnd);
    }
   

    if (onMiddleCtrl) {
        middleCtrl.style.left = blockX - vh(2) + 'px';
        currentMark.span.loopStart = e.clientX;
        updateVideo(e.clientX);
    }
}

function onDown(e) {
    if (e.target === progressBar[0]) {
        addController(ctrlID++, e.pageX);
        video = $("#palyer")[0];
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
    ctrl.css("left", pageX - vh(2))

    ctrl.dblclick(() => {
        ctrl.remove();
        marks.remove(id);
    })

    ctrl.on('mousedown', (e) => {
        currentBlock = e.target;
        currentMark = marks.getById(id);
        middleCtrl = ctrl.find('.middle')[0];
        clac(e);
        downX = e.clientX;
        deltaLeft = blockBound.left - e.clientX;
        deltaRight = blockBound.right - e.clientX;
        blockOriginWith = blockBound.width;
        e.preventDefault();
    })

    marks.push(mark(id));
}

function clac(e) {
    if (!currentBlock) return;
    blockBound = currentBlock.getBoundingClientRect();
    blockX = e.clientX - blockBound.left;
    blockY = e.clientY - blockBound.top;
    onLeftCtrl = blockX < MARGIN
    onRightCtrl = blockX > blockBound.width - MARGIN
    onMiddleCtrl = MARGIN < blockX && blockX < blockBound.width - MARGIN;
}

function mark(id) {
    return {
        id: id,
        span: {
            start: 0,
            loopStart: 0,
            end: 0
        },
        event: [{
            block: [0, 0, 0, 0],
            action: 'click'
        }]
    }
}

function vh(numb) {
    return $(window).height() * (numb) / 100.0;
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

Array.prototype.remove = function (id) {
   var index = 0;
   var find = false;
   for (; index < this.length; index++){
       if (this[index].id == id){
           find = true;
           break;
       }
   }
   if (find) this.splice(index, 1);
};

Array.prototype.getById = function (id) {
    var result = null;
    for (var i = 0; i < this.length; i++){
        var v = this[i];
        if (v.id == id){
            result = v;
            break;
        }
    }
    return result;
}