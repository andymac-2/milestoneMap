'use strict'

// miscellaneous functions.

var Util = {};

Util.clamp = function (min, max, value) {
    value = value > max ? max : value;
    value = value < min ? min : value;
    return value;
};

Util.removeAtIndex = function (array, index) {
    array[index] = array[array.length - 1];
    array.pop();   
};

Util.removeFromArray = function (array, obj) {
    var index = array.indexOf(obj);
    assert (() => index >= 0);

    array[index] = array[array.length - 1];
    array.pop();
};

Util.safeRemoveFromArray = function (array, obj) {
    var index = array.indexOf(obj);
    if (index < 0) {
        return;
    }
    
    array[index] = array[array.length - 1];
    array.pop();
};

Util.removeFromIndexedArray = function (array, obj) {
    assert (() => array[obj.index] = obj);
    var index = obj.index;

    for (var i = index; i < array.length - 1; i++){
        array[index] = array[index + 1];
        array[index].index = index;
    }
    array.pop();
};

Util.swapElements = function (array, obj1, obj2) {
    assert (() => array.indexOf(obj1) >= 0);
    assert (() => array.indexOf(obj2) >= 0);

    var index1 = array.indexOf(obj1);
    var index2 = array.indexOf(obj2);

    var tmp = array[index1];
    array[index1] = array[index2];
    array[index2] = tmp;
};

Util.swapIndexedElements = function (array, index1, index2) {
    assert (() => array[index1].index = index1);
    assert (() => array[index2].index = index2);

    var tmp = array[index1];
    array[index1] = array[index2];
    array[index2] = tmp;

    array[index1].index = index1;
    array[index2].index = index2;
};


// date functions
Util.getISODateOnly = function (date) {
    return new Date(date).toISOString().slice(0, 10);
};
Util.getDateValueFromInputElem = function (elem) {
    return new Date(elem.value + "T01:00:00.000Z").valueOf();
};


//save and restore string
Util.download = function (filename, string, type, parent) {
    var a = Draw.elem("a", {"style": "display:none;"}, parent);
    var file = new Blob([string], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    parent.removeChild(a);
};

Util.upload = function (parent, callback) {
    var input = Draw.elem ("input", {
        "type": "file",
        "style": "display:none;"
    }, parent);

    var reader = new FileReader();
    reader.onload = () => {
        callback (reader.result);
        if (parent.contains(input)){
            parent.removeChild(input);
        }
    };

    var handleFiles = () => {
        var file = input.files[0];
        reader.readAsText(file);
    }
    
    input.addEventListener("change", handleFiles);
    input.click();
};


// string functions
Util.truncate = function (string, length) {
    if (string.length > length - 3) {
        return string.slice(0, length - 3) + "...";
    }
    return string;
};
