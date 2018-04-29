'use strict'

var MilestoneTD = function (text, date, unclicker, onTextChange, onDateChange,
                        attrs, parent) {
    // state
    this.text;
    this.date;

    // view model
    this.unclicker = unclicker;
    this.onTextChange = onTextChange;
    this.onDateChange = onDateChange;
    this.parent = parent;
    this.attrs = attrs;

    //view
    this.elem;

    this.restore(text, date);
    this.draw();
};

MilestoneTD.prototype.restore = function (text, date) {
    this.text = text;
    this.text = this.text === "" ? "Untitled": this.text;
    this.date = date;
};

MilestoneTD.prototype.draw = function () {
    this.elem = Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, this.parent);
};

MilestoneTD.prototype.onclick = function (parent) {
    var height = Draw.getElemHeight(parent);
    parent.innerHTML = "";
    
    var width = height * Draw.svgTextInput.HEIGHTWIDTHRATIO +
        height * Draw.svgDateInput.HEIGHTWIDTHRATIO;
    
    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height * Draw.svgDateInput.TEXTTOTEXTBOXRATIO),
        "x": 0 - width / 2,
        "y": (0 - height)
    }, parent);

    var dateBox = Draw.htmlElem ("input", {
        "class": "svgDateBox",
        "value": Util.getISODateOnly (this.date),
        "type": "date",
        "required": ""
    }, foreign);
    
    dateBox.addEventListener("blur", this.modifyDate.bind(this, dateBox));
    dateBox.addEventListener("blur", e => this.onDateChange(e, this));
    
    var textBox = Draw.htmlElem ("input", {
        "class": "svgTextBox",
        "value": this.text,
        "type": "text"
    }, foreign);
    
    textBox.focus();
    textBox.select();
    textBox.addEventListener("change", this.modifyText.bind(this, textBox));
    textBox.addEventListener("change", e => this.onTextChange(e, this));
};

MilestoneTD.prototype.onunclick = function (parent) {
    parent.innerHTML = "";

    var date = new Date (this.date);
    var datestring = DateHeader.getShortMonth(date) + " " +
        DateHeader.getDate(date) + ": ";
    
    var normalText = Draw.svgElem ("text", {
        "text-anchor": "middle"
    }, parent);
    normalText.textContent = Util.truncate(
        datestring + this.text, Draw.svgTextInput.MAXTEXTLENGTH);
};

// user events
MilestoneTD.prototype.modifyText = function (elem) {
    this.restore(elem.value, this.date);
};

MilestoneTD.prototype.modifyDate = function (elem) {
    this.date = Util.getDateValueFromInputElem (elem);
};
