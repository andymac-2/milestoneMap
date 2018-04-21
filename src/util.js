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

    array[index] = array[array.length - 1];
    array[index].index = index;
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

Util.getISODateOnly = function (date) {
    return new Date(date).toISOString().slice(0, 10);
};
