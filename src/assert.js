'use strict'

/** @define {boolean} */
var NDEBUG = false;

// runtime check, check for user errors.
var runTAssert = function (test) {
    if (test()) {
        return;
    }
    console.assert (false, test.toString());
    console.trace();
    throw Error (test.toString());
};

// debug check
var assert = NDEBUG === true ? () => {} : test => {
    if (test()) {
        return;
    }
    console.assert (false, test.toString());
    console.trace();
};
