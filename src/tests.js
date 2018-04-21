'use strict'

var ast = function (test) {
    var result = test() === true;
    console.assert(result, test.toString());
    return result;
};

var validate = function (obj, test) {
    ast (() => typeof test === "object");
    if (!ast (() => typeof obj === "object")) {
        return;
    };
    ast (() => Array.isArray(test) === Array.isArray(obj));
    ast (() => !Array.isArray(test) || test.length === obj.length);
    for (var key in test) {
        ast (() => test[key] === obj[key] || (typeof test[key] === "object" && test[key] !== null));
        if (typeof test[key] === "object" && test[key] !== null){    
            validate(obj[key], test[key]);
        }
    }
};

var runTests = function (tests) {
    for (var prop in tests) {
	console.group(prop);
	tests[prop]();
	console.groupEnd();
    }
    console.log("Complete.");
}

var runTestSuite = function () {
    // Add tests here
};
