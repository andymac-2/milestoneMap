'use strict'

var Report = function (obj, index, mMap) {
    // state
    this.date;

    //model
    this.index = index;
    this.mMap = mMap;

    this.restore(obj);
};

Report.prototype.restore = function (obj) {
    this.date = obj.date;
};

Report.prototype.save = function () {
    return {date: this.date};
};
