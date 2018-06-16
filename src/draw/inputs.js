'use strict'

/** @constructor
    @struct */
Draw.vertResizableForeign = function (width, margin, attrs, parent) {
    /** @type {number} */ this.width = width;
    /** @type {number} */ this.height = 0;
    /** @type {number} */ this.margin = margin;

    /** @type {Element} */
    this.elem = Draw.svgElem ("g", attrs, parent);
    /** @type {Element} */
    this.foreign = Draw.svgElem ("foreignObject", {
        "width": this.width
    }, this.elem);
    /** @type {Element} */
    this.container = Draw.elem ("div", {
        "style": "width:" + this.width + "px;max-width:" + this.width + "px;"
    }, this.foreign);
    this.container.addEventListener("input", this.update.bind(this));

};

Draw.vertResizableForeign.prototype.update = function () {
    var height = Draw.forceGetElementHeight(this.container) + this.margin * 2;
    if (this.height !== height) {
        this.height = height;
        this.foreign.setAttribute("height", this.height);
        this.foreign.setAttribute("y", -this.height);
        var e = new CustomEvent("verticalResize", {detail: this});
        this.elem.dispatchEvent(e);
    }
};

/** @constructor
    @struct */
Draw.editableParagraph = function (text, options, attrs, parent) {
    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {string} */ this.defaultText = options.defaultText;
    /** @type {string} */ this.text;

    /** @type {Element} */ this.parent = parent;
    
    /** @type {function(Event, Draw.editableParagraph)} */
    this.onchange = options.onchange || function () {};

    attrs["contenteditable"] = "true";
    /** @type {Element} */ this.elem = Draw.elem ("p", attrs, parent);
    this.elem.addEventListener ("input", this.modifyText.bind(this, this.elem));
    this.elem.addEventListener ("input", e => this.onchange (e, this));
    this.elem.addEventListener ("focus", this.onClick.bind(this));
    
    this.restore(text);
    this.draw();
};

Draw.editableParagraph.prototype.restore = function (text) {
    this.text = !text ? this.defaultText: text;
};

Draw.editableParagraph.prototype.draw = function () {
    Draw.activeOrDeactive (
        this.elem, this.onUnClick.bind (this), this.activate.bind (this),
        this.unclicker, this.parent);
};

Draw.editableParagraph.prototype.onUnClick = function () {
    this.elem.textContent = this.text || this.defaultText;
    this.elem.classList.remove("clickedActive");
};

Draw.editableParagraph.prototype.activate = function () {
    this.elem.textContent = this.text;
    this.elem.classList.add("clickedActive");
};

Draw.editableParagraph.prototype.onClick = function () {
    Draw.selectElementContents (this.elem);
};

Draw.editableParagraph.prototype.modifyText = function (elem) {
    this.restore(elem.textContent);
};
