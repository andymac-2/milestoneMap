var VERSION = "1.2.3\u03B2";

window.onload = function () {
    if (!NDEBUG) {
        runTestSuite();
    }
    var app = document.getElementById ("app");

    new Loader (app);
}



