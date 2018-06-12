'use strict'

/** @type {function(string, Object=, Element=)} */
Draw.elem = function (elemType, attributes, parentElem) {
    var elem = document.createElement(elemType);
    if (attributes) {
        for (var prop in attributes) {
	    elem.setAttribute(prop, attributes[prop]);
        }
    }
    if (parentElem) {
        parentElem.appendChild(elem);
    }
    return elem;
};

Draw.elemNS = function (NS, elemType, attributes, parentElem) {
    var elem = document.createElementNS(NS, elemType);
    if (attributes) {
        for (var prop in attributes) {
	    elem.setAttribute(prop, attributes[prop]);
        }
    }
    if (parentElem) {
        parentElem.appendChild(elem);
    }
    return elem;
};

Draw.svgElem = Draw.elemNS.bind(null, "http://www.w3.org/2000/svg");
Draw.htmlElem = Draw.elemNS.bind(null, "http://www.w3.org/1999/xhtml");
