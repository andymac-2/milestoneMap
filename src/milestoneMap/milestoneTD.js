'use strict'

var MilestoneTD = function (options, title, date, comment) {
    
    // state
    this.title;
    this.comment;
    this.date;

    // view model
    this.unclicker = options.unclicker;
    this.onChange = options.onChange || (() => {});
    this.parent = options.parent;
    this.attrs = options.attrs || {};

    this.modified = false;

    //view
    this.elem;

    this.restore(title, date, comment);
    this.draw();
};
MilestoneTD.HEIGHT = 35;
MilestoneTD.TEXTBOXHEIGHT = 45;
MilestoneTD.YOFFSET = 55;
MilestoneTD.XOFFSET = 5;
MilestoneTD.HEIGHTWIDTHRATIO = 6;
MilestoneTD.MAXTEXTLENGTH = 100;
MilestoneTD.prototype.restore = function (title, date, comment) {
    this.title = title;
    this.title = this.title === "" ? "Untitled": this.title;
    this.date = date;
    this.comment = comment;
    this.comment = this.comment === "" ? "" : this.comment;
};

MilestoneTD.prototype.draw = function () {
    this.elem = Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, this.parent);
};

MilestoneTD.prototype.onclick = function (parent) {
    var height = MilestoneTD.TEXTBOXHEIGHT;
    parent.innerHTML = "";
    
    var width = height * MilestoneTD.HEIGHTWIDTHRATIO;
    
    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height),
        "x": MilestoneTD.XOFFSET,
        "y": (0 - MilestoneTD.YOFFSET)
    }, parent);

    var dateBox = Draw.htmlElem ("input", {
        "class": "svgDateBox",
        "value": Util.getISODateOnly (this.date),
        "type": "date",
        "required": ""
    }, foreign);
    
    dateBox.addEventListener("change", this.modifyDate.bind(this, dateBox));
    
    var titleBox = Draw.htmlElem ("input", {
        "class": "svgTextBox",
        "value": this.title,
        "type": "text",
        "placeholder": "Milestone Name"
    }, foreign);
    
    titleBox.addEventListener("change", this.modifyTitle.bind(this, titleBox));

    var commentBox = Draw.htmlElem ("input", {
        "class": "svgCommentBox",
        "value": this.comment,
        "type": "text",
        "placeholder": "Milestone Comment"
    }, foreign);
    
    commentBox.addEventListener("change", this.modifyComment.bind(this, commentBox));
};

MilestoneTD.prototype.onunclick = function (parent) {
    if (this.modified) {
        this.onChange(this);
        this.modified = false;
    }

    parent.innerHTML = "";

    var date = new Date (this.date);
    var datestring = DateHeader.getShortMonth(date) + " " +
        DateHeader.getDate(date) + ": ";
    
    var dateTitle = Draw.svgElem ("text", {
        "text-anchor": "start",
        "transform": "translate(5, -15)",
    }, parent);
    dateTitle.textContent = Util.truncate(
        datestring + this.title, MilestoneTD.MAXTEXTLENGTH);

    var comment = Draw.svgElem ("text", {
        "class": "msComment",
        "transform": "translate(5, 0)"
    }, parent);
    comment.textContent = Util.truncate(this.comment, MilestoneTD.MAXTEXTLENGTH);
};

// user events
MilestoneTD.prototype.modifyTitle = function (elem) {
    this.restore(elem.value, this.date, this.comment);
    this.modified = true;
};

MilestoneTD.prototype.modifyComment = function (elem) {
    this.restore(this.title, this.date, elem.value);
    this.modified = true;
};

MilestoneTD.prototype.modifyDate = function (elem) {
    this.date = Util.getDateValueFromInputElem (elem);
    this.modified = true;
};
