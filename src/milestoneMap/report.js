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
    elem.textContent = this.name + ": "  + Util.getISODateOnly(this.date);
    return elem;
};

Report.prototype.drawHeader = function (text, attrs, parent) {
    var g = Draw.svgElem ("g", attrs, parent);
    Draw.svgElem ("text", {
        "class": "reportHeader",
        "text-anchor": "end"
    }, g).textContent = text;
    
    var g2 = Draw.svgElem ("g", {}, g);
    new Draw.svgDateInput (
        this.date, Draw.ALIGNRIGHT, this.mMap.unclicker,
        this.modifyDate.bind(this), {
            "transform": "translate(0, 20)",
            "class": "reportDate"
        }, g2);

    g2 = Draw.svgElem ("g", {}, g);
    new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
            "transform": "translate(5, 20)",
            "class": "reportName"
        }, g2);

    return g;
};


// user events
Report.prototype.modifyDate = function (e, input) {
    this.date = input.date;
    // TODO: draw line
};

Report.prototype.modifyName = function (e, input) {
    this.name = input.text;
    // TODO: redraw dropdown lists
    // TODO: redraw other report display.
};
