'use strict'

/** @constructor
    @struct */
Draw.svgDateInput = function (options, date) {
    /** @type {number} */ this.date;

    var alignment = options.alignment;

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

    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {function(Event, Draw.svgDateInput)} */ this.onchange = options.onchange || (() => {});
    /** @type {Element} */ this.parent = options.parent;
    /** @type {Object<string>} */ this.attrs = options.attrs || {};
    /** @type {?number} */ this.min = options.min || null;
    /** @type {?number} */ this.max = options.max || null;

    /** @type {Element} */ this.elem;

    this.restore (date);
    this.draw();
};
Draw.svgDateInput.HEIGHTWIDTHRATIO = 10;
Draw.svgDateInput.TEXTTOTEXTBOXRATIO = 1.5;

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

    var attrs = {
        "class": "svgDateBox",
        "value": Util.getISODateOnly (this.date),
        "type": "date",
        "required": ""
    };
    if (this.min) {
        attrs["min"] = Util.getISODateOnly (this.min);
    }
    if (this.max) {
        attrs["max"] = Util.getISODateOnly (this.max);
    }
    
    var dateBox = Draw.htmlElem ("input", attrs, foreign);
    dateBox.focus();
    dateBox.select();
    dateBox.addEventListener("blur", this.modifyDate.bind(this, dateBox));
    dateBox.addEventListener("blur", e => this.onchange(e, this));
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
