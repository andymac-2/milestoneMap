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
