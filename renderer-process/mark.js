var marks = [];
var activeMark = null;

function setActiveMark(id) {
    activeMark = marks.getById(id);
}

function getActivedMark() {
    return activeMark;
}

function reset() {
    activeMark = null;
    marks = [];
}

function removeMark(id) {
    marks.remove(id);
}

function addEmptyMark(id) {
    marks.push(mark(id))
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
    };
}

function getAllMarksJson() {
    return JSON.stringify(marks);
}

function getAllMarks() {
    return marks;
}

function getMark(id) {
    return marks.getById(id);
}

Array.prototype.remove = function (id) {
    var index = 0;
    var find = false;
    for (; index < this.length; index++) {
        if (this[index].id == id) {
            find = true;
            break;
        }
    }
    if (find) this.splice(index, 1);
}

Array.prototype.getById = function (id) {
    var result = null;
    for (var i = 0; i < this.length; i++) {
        var v = this[i];
        if (v.id == id) {
            result = v;
            break;
        }
    }
    return result;
}


module.exports = {
    setActivemark: setActiveMark,
    getActivedMark: getActivedMark,
    add: addEmptyMark,
    getChild: getMark,
    remove: removeMark,
    reset: reset,
    getMarks: getAllMarks,
}