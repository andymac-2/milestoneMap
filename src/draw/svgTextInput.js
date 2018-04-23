'use strict'

Draw.svgTextInput = function (text, alignment, unclicker, onchange, attrs, parent) {
    // state
    this.text;

    // view model
    switch (alignment) {
    case Draw.ALIGNLEFT:
        this.anchor = "start";
        this.x = 0;
        break;
    case Draw.ALIGNCENTER:
        this.anchor = "middle";
        this.x = Draw.svgTextInput.TEXTBOXWIDTH / 2;
        break;
    default:
        assert (() => false);
        break;
    }
    this.unclicker = unclicker;
    this.onchange = onchange;
    this.parent = parent;
    this.attrs = attrs;

    //view
    this.elem;

    this.restore(text);
    this.draw();
};

Draw.svgTextInput.TEXTBOXWIDTH = 200;
Draw.svgTextInput.prototype.restore = function (text) {
    this.text = text;
};

Draw.svgTextInput.prototype.draw = function () {
    this.elem = Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, this.parent);
};

Draw.svgTextInput.prototype.onclick = function (parent) {
    parent.innerHTML = "";
    
    var foreign = Draw.svgElem("foreignObject", {
        "width": "200",
        "height": "30",
        "x": this.x,
        "y": "-20"
    }, parent);
    
    var textBox = Draw.htmlElem ("input", {
        "name": "test",
        "width": "90%",
        "value": this.text,
        "type": "text"
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
    normalText.textContent = this.text;
};

// user events
Draw.svgTextInput.prototype.modifyText = function (elem) {
    this.text = elem.value;
    this.text = this.text === "" ? "Untitled": this.text;
};
