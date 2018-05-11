'use strict'

var Report = function (obj, index, mMap) {
    // state
    this.date;
    this.name;

    //view
    this.lineElem = Draw.svgElem ("g", {
        "class": "reportLine"
    });
    this.lineElemMain = Draw.svgElem ("g", {
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

Report.prototype.getMenuText = function () {
    return this.name + ": "  + Util.getISODateOnly(this.date);
};

Report.prototype.drawHeader = function (attrs, parent) {
    this.headerElem = Draw.svgElem ("g", attrs, parent);
    var text = this === this.mMap.currReport ? "Current:": "Baseline:"
    
    Draw.svgElem ("text", {
        "class": "reportHeader",
        "text-anchor": "end"
    }, this.headerElem).textContent = text;
    
    var g2 = Draw.svgElem ("g", {}, this.headerElem);
    new Draw.svgDateInput ({
        unclicker: this.mMap.unclicker,
        onchange: this.modifyDate.bind(this),
        parent: g2,
        alignment: Draw.ALIGNRIGHT,
        attrs: {
            "transform": "translate(0, 20)",
            "class": "reportDate"
        }
    }, this.date);

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

    if (!this.mMap.isInInterval(this.date)) {
        return this.lineElem;
    }

    var x = this.mMap.getXCoord(this.date);

    Draw.svgElem("line", {
        "x1": x, "y1": DateHeader.ROWY,
        "x2": x, "y2":"100%"
    }, this.lineElem);

    Draw.svgElem("line", {
        "x1": x, "y1": 0,
        "x2": x, "y2":"100%"
    }, this.lineElemMain);

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
    this.mMap.reportSelectors();
    this.drawLine();
};

Report.prototype.modifyName = function (e, input) {
    this.name = input.text;
    this.mMap.reportSelectors();
};

