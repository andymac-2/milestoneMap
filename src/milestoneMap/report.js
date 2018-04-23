'use strict'

var Report = function (obj, index, mMap) {
    // state
    this.date;
    this.name;

    //model
    this.index = index;
    this.mMap = mMap;

    this.restore(obj);
};

Report.prototype.restore = function (obj) {
    this.date = obj["date"];
    this.name = obj["name"];
};

Report.prototype.save = function () {
    return {"date": this.date, "name": this.name};
};

Report.prototype.drawMenu = function (parent) {
    var elem = Draw.elem ("option", {
        "value": this.index,
    }, parent);
    elem.textContent = this.name + ": "  + new Date(this.date).toUTCString();
    return elem;
};
