var VERSION = "1.2.0";

window.onload = function () {
    if (!NDEBUG) {
        runTestSuite();
    }
    var app = document.getElementById ("app");

    new Loader (app);
}



