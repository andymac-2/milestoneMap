'use strict'

/** @constructor
    @struct */
var Unclicker = function (elem) {
    this.elem = elem;
    
    this.onceOff = [];
    this.singleId = 0;

    this.multiple = [];
    this.multiId = 0;

    elem.addEventListener("click", this.click.bind(this), true);
};

Unclicker.prototype.onUnclickOnce = function (elem, event) {
    this.onceOff.push({
        elem: elem,
        event: event
    });
};

Unclicker.prototype.onUnclickMultiple = function (elem, event) {
    this.multiple.push({
        elem: elem,
        event: event
    });
};

Unclicker.prototype.click = function (event) {
    for (var i = 0; i < this.onceOff.length; i++) {
        while (this.onceOff[i] &&
               (!this.elem.contains(this.onceOff[i].elem) ||
                !this.onceOff[i].elem.parentNode.contains(event.target))) {
            this.onceOff[i].event();
            this.onceOff[i] = this.onceOff[this.onceOff.length - 1];
            this.onceOff.pop();
        }
    }

    for (var i = 0; i < this.multiple.length; i++) {
        if (!this.multiple[i].elem.parentNode.contains(event.target)) {
            this.multiple[i].event();
        }
    }
};
