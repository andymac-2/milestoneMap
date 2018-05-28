'use strict'

// miscellaneous functions.

var Util = {};
Util.allertErr = function (err) {
     alert (err.name + ": " + err.message);
};

Util.clamp = function (min, max, value) {
    value = value > max ? max : value;
    value = value < min ? min : value;
    return value;
};

Util.removeAtIndex = function (array, index) {
    array[index] = array[array.length - 1];
    array.pop();   
};

Util.insertInSortedArray = function (arr, cmpFunc, elem) {
    for (var i = arr.length; i > 0 && cmpFunc(arr[i - 1], elem) > 0; i--) {
        arr[i] = arr[i - 1];
    }
    arr[i] = elem;
    return arr;
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

Util.refreshIndices = function (arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i].index = i;
    }
};
Util.isStrictlySorted = function (arr, cmpFunc) {
    for (var i = 0; i < arr.length - 1; i++) {
        if (cmpFunc(arr[i], arr[i + 1]) > 0) {
            return false;
        }
    }
    return true;
};
Util.isSortedByIndex = function (arr) {
    return Util.isSorted (arr, (a, b) => a.index - b.index);
};
Util.addToIndexedArray = function (arr, obj, index) {
    assert (() => index <= arr.length);
    assert (() => index >= 0);
    for (var i = arr.length; i > index; i--) {
        arr[i] = arr[i - 1];
        arr[i].index = i;
    }

    arr[index] = obj;
    obj.index = index;

    return arr;
};
Util.addToIndexedArrayEnd = function (arr, obj) {
    obj.index = arr.length;
    arr.push (obj);

    return arr;
};
Util.removeFromIndexedArray = function (array, obj) {
    assert (() => array[obj.index] === obj);
    var index = obj.index;

    for (var i = index; i < array.length - 1; i++){
        array[i] = array[i + 1];
        array[i].index = i;
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
Util.fromISODateOnly = function (string) {
    return new Date(string + "T01:00:00.000Z").valueOf();
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

Util.upload = function (parent, callback, type) {
    var attrs = {
        "type": "file",
        "style": "display:none;"
    };
    if (type) {
        attrs["accept"] = type;
    }
    var input = Draw.elem ("input", attrs, parent);

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

// this functio9n lacks compatibility TODO: create alternative.
Util.getCSS = function () {
    var css= [];

    for (var sheeti = 0; sheeti < document.styleSheets.length; sheeti++) {
        var sheet = document.styleSheets[sheeti];
        var rules = ('cssRules' in sheet)? sheet.cssRules : sheet.rules;
        for (var rulei= 0; rulei<rules.length; rulei++) {
            var rule= rules[rulei];
            if ('cssText' in rule)
                css.push(rule.cssText);
            else
                css.push(rule.selectorText+' {\n'+rule.style.cssText+'\n}\n');
        }
    }

    return css.join('\n');
};

Util.throttleEvent = function (elem, eventName, callback, time) {
    time = time || 100;
    var timer;
    var throttle = function () {
        if (timer) {
            window.clearTimeout(timer);
        }
        timer = setTimeout(callback, time);
    };
    elem.addEventListener(eventName, throttle);
}

Util.parseCSV = function (str) {
    var arr = [];
    var quote = false;  // true means we're inside a quoted field
    var c, col, row;

    // iterate over each character, keep track of current row and column (of the returned array)
    for (var row = col = c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];      
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';  

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }  
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    if (arr[arr.length - 1].length === 0) {
        arr.pop();
    }
    return arr;
};
