'use strict'

/** @constructor
    @struct */
Draw.svgTextInput = function (text, alignment, unclicker, onchange, attrs, parent, defaultText) {
    // state
    /** @type {string} */ this.text;
    /** @type {string} */ this.defaultText = defaultText === undefined ? "Untitled" : defaultText;

    // view model
    switch (alignment) {
    case Draw.ALIGNLEFT:
        this.anchor = "start";
        break;
    case Draw.ALIGNCENTER:
        this.anchor = "middle";
        break;
    default:
        assert (() => false);
        break;
    }
    /** @type {Unclicker} */ this.unclicker = unclicker;
    /** @type {function(Event, Draw.svgTextInput)} */ this.onchange = onchange;
    /** @type {Element} */ this.parent = parent;
    /** @type {Object<string>} */ this.attrs = attrs;

    //view
    /** @type {Element} */ this.elem;

    /** @type {Element} */ this.textBox;

    this.restore(text);
    this.draw();
};

Draw.svgTextInput.HEIGHTWIDTHRATIO = 10;
Draw.svgTextInput.TEXTTOTEXTBOXRATIO = 1.4;
Draw.svgTextInput.MAXTEXTLENGTH = 40;
Draw.svgTextInput.prototype.restore = function (text) {
    this.text = text;
    this.text = this.text === "" ? this.defaultText: this.text;
};

Draw.svgTextInput.prototype.draw = function () {
    this.elem = Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, this.parent);
};

Draw.svgTextInput.prototype.onclick = function (parent) {
    var height = Draw.getElemHeight(parent);
    parent.innerHTML = "";
    
    var width = height * Draw.svgTextInput.HEIGHTWIDTHRATIO;
    var x = this.anchor === "middle" ? width / -2 : 0;

    var offset = Draw.getElemXY (parent);
    var unx = -offset.x;
    var uny = -offset.y
    
    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height * Draw.svgTextInput.TEXTTOTEXTBOXRATIO),
        "transform": "translate(" + unx + ", " + uny + ")",
        "x": x - unx,
        "y": (0 - height) - uny
    }, parent);
    
    var textBox = Draw.elem ("input", {
        "class": "svgTextBox",
        "type": "text",
        "value": this.text
    }, foreign);
    textBox.focus();
    textBox.select();
    textBox.addEventListener("change", this.modifyText.bind(this, textBox));
    textBox.addEventListener("change", e => this.onchange(e, this));
};

Draw.svgTextInput.prototype.onunclick = function (parent) {
    parent.innerHTML = "";
    
    var normalText = Draw.svgElem ("text", {
        "text-anchor": this.anchor
    }, parent);
    normalText.textContent = Util.truncate(
        this.text, Draw.svgTextInput.MAXTEXTLENGTH);
};

// user events
Draw.svgTextInput.prototype.modifyText = function (elem) {
    this.restore(elem.value);
};
