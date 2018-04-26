'use strict'

Draw.svgDateInput = function (date, alignment, unclicker, onchange, attrs, parent) {
    this.date;

    switch (alignment) {
    case Draw.ALIGNLEFT:
        this.anchor = "start";
        break;
    case Draw.ALIGNRIGHT:
        this.anchor = "end"
        break;
    default:
        assert (() => false);
        break;
    }

    this.unclicker = unclicker;
    this.onchange = onchange;
    this.parent = parent;
    this.attrs = attrs;

    this.elem;

    this.restore (date);
    this.draw();
};
Draw.svgDateInput.HEIGHTWIDTHRATIO = 10;
Draw.svgDateInput.TEXTTOTEXTBOXRATIO = 1.4

Draw.svgDateInput.prototype.restore = function (date) {
    this.date = date;
};

Draw.svgDateInput.prototype.draw = function () {
    this.elem = Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, this.parent);
};

Draw.svgDateInput.prototype.onclick = function (parent) {
    var height = Draw.getElemHeight(parent); 
    parent.innerHTML = "";

    var width = height * Draw.svgDateInput.HEIGHTWIDTHRATIO;
    var x = this.anchor === "start" ? 0 : - width;

    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": height * Draw.svgDateInput.TEXTTOTEXTBOXRATIO,
        "x": x,
        "y": 0 - height
    }, parent);
    
    var dateBox = Draw.htmlElem ("input", {
        "class": "svgDateBox",
        "value": Util.getISODateOnly (this.date),
        "type": "date",
        "required": ""
    }, foreign);
    dateBox.focus();
    dateBox.select();
    dateBox.addEventListener("change", this.modifyDate.bind(this, dateBox));
    dateBox.addEventListener("change", e => this.onchange(e, this));
};

Draw.svgDateInput.prototype.onunclick = function (parent) {
    parent.innerHTML = "";

    var normalText = Draw.svgElem ("text", {
        "text-anchor": this.anchor
    }, parent);
    normalText.textContent = Util.getISODateOnly (this.date);
};

Draw.svgDateInput.prototype.modifyDate = function (elem) {
    this.date = Util.getDateValueFromInputElem (elem);
};
