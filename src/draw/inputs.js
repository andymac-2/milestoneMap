'use strict'

/** @constructor
    @struct */
Draw.vertResizableForeign = function (width, attrs, parent) {
    /** @type {number} */ this.width = width;
    /** @type {number} */ this.height = 0;

    /** @type {Element} */
    this.elem = Draw.svgElem ("g", attrs, parent);
    /** @type {Element} */
    this.foreign = Draw.svgElem ("foreignObject", {
        "width": this.width
    }, this.elem);
    /** @type {Element} */
    this.container = Draw.elem ("div", {
        "style": "width:" + this.width + "px;"
    }, this.foreign);

};

Draw.vertResizableForeign.prototype.update = function () {
    this.height = Draw.getElemHeight (this.container);
    this.foreign.setAttribute("height", this.height);
};

/** @constructor
    @struct */
Draw.editableParagraph = function (text, options, attrs, parent) {
    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {string} */ this.defaultText = options.defaultText;

    /** @type {Element} */ this.parent = parent;
    
    /** @type {function(Event, Draw.editableParagraph)} */
    this.onchange = options.onchange || function () {};

    attrs["contenteditable"] = "true";
    /** @type {Element} */ this.elem = Draw.elem ("p", attrs, parent);
    this.elem.addEventListener ("change", e => this.onchange (e, this));

    this.restore(text);
    this.draw();
};

Draw.editableParagraph.prototype.restore = function (text) {
    this.text = text === "" ? this.defaultText: this.text;
};

Draw.editableParagraph.prototype.draw = function () {
    Draw.activeOrDeactive (
        this.elem, this.onUnClick.bind (this), this.onClick (this),
        this.unclicker, this.parent);
};

Draw.editableParagraph.prototype.onUnClick = function () {
    this.elem.textContent = this.text || this.defaultText;
};

Draw.editableParagraph.prototype.onClick = function () {
    this.elem.textContent = this.text;
};
