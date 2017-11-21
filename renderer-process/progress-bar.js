const $ = require('jquery')

var progressBarRect = null
var video = null

var marks = []
var cnt = 0

$('.progress-bar').on('mousedown', (event) => {

    var offset = $('.progress-bar').offset()
    progressBarRect = {
        'left': offset.left,
        'right': offset.left + $('.progress-bar').width()
    }
    video = $('#palyer')[0]

    updateVideo(event);

    if ($('#ctrl-0').length) {
        updateController(0, event.pageX)
    } else {
        addController(0, event.pageX)
    }
})

$('body').on('mouseup', (event) => {
    progressBarRect = null
    video = null
})

$('body').on('mousemove', (event) => {
    updateVideo(event)
})


function addMark(pX) {
    for (var i = 0; i < marks.length; i++) {
        var mark = marks[i]
        var t = space2time(pX)
        if (mark.span.start < t && mark.span.end) {
            return;
        }
    }
}

function addController(id, pageX) {
    $('.controller-container').append(`<div id='ctrl-${id}' class='ctrl'></div>`)
    $(`#ctrl-${id}`).append(`<div class='middle'></div>`)
    $(`#ctrl-${id}`).find('.middle').append(`<div class='triangle'></div>`);
    $(`#ctrl-${id}`).find('.middle').append(`<div class='line'></div>`);
    $(`#ctrl-${id}`).find('.middle').append(`<div class='circle'></div>`);
    $(`#ctrl-${id}`).append(`<div class='left'></div>`)
    $(`#ctrl-${id}`).find('.left').append(`<div class='triangle'></div>`)
    $(`#ctrl-${id}`).find('.left').append(`<div class='line'></div>`)
    $(`#ctrl-${id}`).append(`<div class='right'></div>`)
    $(`#ctrl-${id}`).find('.right').append(`<div class='triangle'></div>`)
    $(`#ctrl-${id}`).find('.right').append(`<div class='line'></div>`)
    $(`#ctrl-${id}`).css("left", pageX - vh(2))
    $(`#ctrl-${id}`).dblclick(()=>{
        $(`#ctrl-${id}`).remove();
    })
}

function updateController(id, pageX) {
    $(`#ctrl-${id}`).css("left", pageX - vh(2))
}

function mark() {}

function vh(numb) {
    return $(window).height() * (numb) / 100.0;
}

function updateVideo(event) {
    if (progressBarRect == null || video == null || video == undefined) {
        return;
    }
    video.currentTime = space2time(event.pageX, progressBarRect, video.duration)
}

/**
 * 将进度条横轴的某点currentX转换成某段时间的时间点
 * @param {pageX} currentX 当前所在空间点
 * @param {间距} space 间距总长度
 * @param {时间总长度} duration  时间总长度
 */
function space2time(currentX, space, duration) {
    var start = space.left
    var end = space.right
    if (currentX < start) {
        return 0;
    } else if (currentX > end) {
        return duration;
    } else {
        return (currentX - start) / (end - start) * duration;
    }
}