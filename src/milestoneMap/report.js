'use strict'

var Report = function (obj, index, mMap) {
    // state
    this.date;
    this.name;

    //view
    this.lineElem = Draw.svgElem ("g", {
        "class": "reportLine"
    });

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
    elem.textContent = this.name + ": "  + Util.getISODateOnly(this.date);
    return elem;
};

Report.prototype.drawHeader = function (attrs, parent) {
    this.headerElem = Draw.svgElem ("g", attrs, parent);
    var text = this === this.mMap.currReport ? "Current:": "Baseline:"
    
    Draw.svgElem ("text", {
        "class": "reportHeader",
        "text-anchor": "end"
    }, this.headerElem).textContent = text;
    
    var g2 = Draw.svgElem ("g", {}, this.headerElem);
    new Draw.svgDateInput (
        this.date, Draw.ALIGNRIGHT, this.mMap.unclicker,
        this.modifyDate.bind(this), {
            "transform": "translate(0, 20)",
            "class": "reportDate"
        }, g2);

    g2 = Draw.svgElem ("g", {}, this.headerElem);
    new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
            "transform": "translate(5, 20)",
            "class": "reportName"
        }, g2);

    return this.headerElem;
};

Report.prototype.drawLine = function () {
    this.lineElem.innerHTML = "";

    var x = this.mMap.getXCoord(this.date);

    Draw.svgElem("line", {
        "x1": x, "y1": DateHeader.ROWY,
        "x2": x, "y2": Draw.getElemHeight(this.mMap.elem)
    }, this.lineElem);

    return this.lineElem;
};

Report.prototype.deleteThis = function () {
    var milestones = this.mMap.msAtReports.filter (ms => ms.report === this);
    milestones.forEach(ms => ms.deleteThis());

    this.mMap.removeReport (this);
    this.mMap.currReport = this.mMap.cmpReport;
};


// user events
Report.prototype.modifyDate = function (e, input) {
    this.date = input.date;
    this.drawLine();
};

Report.prototype.modifyName = function (e, input) {
    this.name = input.text;
    // TODO: redraw dropdown lists
    // TODO: redraw other report display.
};

