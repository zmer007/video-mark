const $ = require('jquery')

var video = null

var marks = []
var cnt = 0

var currentBlock = null
var blockBound, blockX, blockY;
var blockOriginWith;
var onLeftCtrl, onRightCtrl, onMiddleCtrl, onBottomCtrl;
var downX;

var progressBar = null;
var e;

var redraw = false;

$(() => {

    progressBar = $('.progress-bar');

    progressBar.on('mousedown', onDown);
    $(document).on('mousemove', onMove);
    $(document).on('mouseup', onUp);
    
    progressBar.on('touchdown', onTouchDown)
    $(document).on('touchmove', onTouchMove);
    $(document).on('touchen', onTouchEnd);
})

function onTouchDown(e) {
    onDown(e.touches[0]);
    e.preventDefault();
}

function onTouchMove(e) {
    onMove(e.touches[0])
}

function  onTouchEnd(e) {
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

function animate(){
    requestAnimationFrame(animate);
    if (!redraw) return;
    redraw = false;

    if (!currentBlock) return;
    if (onRightCtrl) {
        currentBlock.style.width = Math.max(blockX, vh(4)) + 'px';
    } 
    if (onLeftCtrl) {
        var currentWidth = Math.max(downX - e.clientX + blockOriginWith, vh(4));
        if (currentWidth > vh(4)) {
            currentBlock.style.width = currentWidth + 'px';
            currentBlock.style.left = e.clientX + 'px';
        }
    }
}

var a = 0;
function onDown(e) {
    if (e.target === progressBar[0]){
        addController(a++, e.pageX);
    }
}


function addController(id, pageX) {
    $('.controller-container').append(`<div id='ctrl-${id}' class='ctrl'></div>`)
    var ctrl = $(`#ctrl-${id}`)
    ctrl.append(`<div class='middle'></div>`)
    ctrl.find('.middle').append(`<div class='triangle'></div>`);
    ctrl.find('.middle').append(`<div class='line'></div>`);
    ctrl.find('.middle').append(`<div class='circle'></div>`);
    ctrl.append(`<div class='left'></div>`)
    ctrl.find('.left').append(`<div class='triangle'></div>`)
    ctrl.find('.left').append(`<div class='line'></div>`)
    ctrl.append(`<div class='right'></div>`)
    ctrl.find('.right').append(`<div class='triangle'></div>`)
    ctrl.find('.right').append(`<div class='line'></div>`)
    ctrl.css("left", pageX - vh(2))
   
    ctrl.dblclick(()=>{
        ctrl.remove();
    })

    ctrl.on('mousedown', (e) => {
        currentBlock = e.target;
        clac(e);
        downX = e.clientX;
        blockOriginWith = blockBound.width;
        e.preventDefault();
    })
}

function clac(e){
    if (!currentBlock) return;
    blockBound = currentBlock.getBoundingClientRect();
    blockX = e.clientX - blockBound.left;
    blockY = e.clientY - blockBound.top;
    onLeftCtrl = blockX < vh(2)
    onRightCtrl = blockX > blockBound.width - vh(2)
}

function mark(id, pageX) {
    var time = space2time(pageX, progressBarRect, video.duration)
    return {
        'id': id,
        'span': {
            'start': time,
            'loopStart': time,
            'end': time
        },
        'event': [{
            'block': [0, 0, 0, 0],
            'action': 'click'
        }]
    }
}

function vh(numb) {
    return $(window).height() * (numb) / 100.0;
}

function updateVideo(e) {
    if (progressBarRect == null || video == null || video == undefined) {
        return;
    }
    video.currentTime = space2time(e.pageX, progressBarRect, video.duration)
}

/**
 * 将进度条横轴的某点currentX转换成某段时间的时间点
 * @param {pageX} pageX 当前所在空间点
 * @param {间距} space 间距总长度
 * @param {时间总长度} duration  时间总长度
 */
function space2time(pageX, space, duration) {
    var start = space.left
    var end = space.right
    if (pageX < start) {
        return 0;
    } else if (pageX > end) {
        return duration;
    } else {
        return (pageX - start) / (end - start) * duration;
    }
}