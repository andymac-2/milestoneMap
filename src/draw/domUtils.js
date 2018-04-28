'use strict'

Draw.verticalReflow = function (yOffset, elements) {
    elements.forEach(elem => {
        elem.elem.setAttribute("transform", "translate(0, " + yOffset + ")");
        yOffset += elem.height;
    });
    return yOffset;
};

Draw.deactivate = function (elem) {
    elem.classList.add("hidden");
    elem.classList.remove("active");
};

Draw.activate = function (elem) {
    elem.classList.remove("hidden");
    elem.classList.add("active");
};

Draw.getElemXY = function (elem) {
    var matrix = elem.getCTM();
    return {x: matrix.e, y: matrix.f};
};
Draw.getElemHeight = function (elem) {
    return elem.getBoundingClientRect().height;
};
Draw.getElemWidth = function (elem) {
    return elem.getBoundingClientRect().width;
};


// an element drawn one way when clicked, and drawn another way when clicked elsewhere.
Draw.activeOnClickElem = function (normal, active, unclicker, attrs, parent) {
    var g = Draw.svgElem ("g", attrs, parent);
    var evt;
    
    var onclick = function ()  {
        active (g);
        parent.removeEventListener ("click", onclick);
        unclicker.onUnclickOnce (parent, onUnclick);
    };

    var onUnclick = function () {
        normal (g);
        parent.addEventListener ("click", onclick);
    };

    onUnclick ();
    return g;
};

// an element with a fixed x relative to the window
Draw.fixedXElement = function (xoffset, y, elem, parentElem) {
    var timer;
    var moveNow = function () {
        elem.setAttribute ("transform", "translate(" +
                           (xoffset + parentElem.scrollLeft) + " " +
                           y + ")");
    };
    var move = function () {
        if (timer) {
            window.clearTimeout(timer);
        }
        timer = setTimeout(moveNow, 100);
    };
    parentElem.addEventListener("scroll", move)
    moveNow ();
};
