'use strict'

Draw.verticalReflow = function (yOffset, elements) {
    elements.forEach(model => {
        model.elem.setAttribute("transform", "translate(0, " + yOffset + ")");
        model.yOffset = yOffset;
        yOffset += model.height;
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
    var matrix = elem["getCTM"]();
    return {x: matrix["e"], y: matrix["f"]};
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
    return Draw.activeOrDeactive (g, normal, active, unclicker, parent);
};

Draw.activeOrDeactive = function (elem, normal, active, unclicker, parent) {
    var onclick = function ()  {
        active (elem);
        parent.removeEventListener ("click", onclick);
        if (parent.contains(elem)) {
            unclicker.onUnclickOnce (parent, onUnclick);
        }
    };
    
    var onUnclick = function () {
        normal (elem);
        if (parent.contains(elem)) {
            parent.addEventListener ("click", onclick);
        }
    };

    onUnclick ();
    return elem;
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

Draw.getTextWidth = function (font, text) {  
    var ctx = Draw.getTextWidth.ctx;
    ctx.font = font;
    return ctx.measureText(text).width;
};
Draw.getTextWidth.ctx = document.createElement("canvas").getContext("2d");
