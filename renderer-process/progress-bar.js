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
    // console.table(marks)
})

$('body').on('mousemove', (event) => {
    updateVideo(event)
})


function addMark(pX) {
    for (var i = 0; i < marks.length; i++) {
        var mark = marks[i]
        var t = space2time(pX, progressBarRect, video.duration)
        if (mark.span.start < t && mark.span.end) {
            return;
        }
    }
}

function addController(id, pageX) {
    marks.push(mark(id, pageX))
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

    ctrl.on('mousedown', (event) => {
        // ctrl.css('width', ctrl.width() + vh(2))
        // ctrl.css('left', event.pageX - vh(2))
    })

    ctrl.on('mousemove', (event) => {
        ctrl.css('left', event.pageX)
    })
}

function updateController(id, pageX) {
    $(`#ctrl-${id}`).css("left", pageX - vh(2))
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

function updateVideo(event) {
    if (progressBarRect == null || video == null || video == undefined) {
        return;
    }
    video.currentTime = space2time(event.pageX, progressBarRect, video.duration)
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