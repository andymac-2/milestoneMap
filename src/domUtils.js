'use strict'

var Draw = {};

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


Draw.MENUSPACING = 45;

Draw.ALIGNCENTER = 0;
Draw.ALIGNLEFT = 1;

Draw.visibleMenu = function (alignment, entries, parent) {
    var g = Draw.svgElem ("g", {
        "class": "menu",
    }, parent);

    switch (alignment) {
    case Draw.ALIGNCENTER:
        var x = (entries.length + 1) * Draw.MENUSPACING / -2;
        break;
    case Draw.ALIGNLEFT:
        x = Draw.MENUSPACING / -2;
        break;
    }
   

    for (var i = 0; i < entries.length; i++) {
        x += Draw.MENUSPACING;
        
        var entryGroup = Draw.svgElem ("g", {
            "transform": "translate(" + x + ", 0)",
            "class": "menuEntry"
        }, g);

        entryGroup.addEventListener ("click", entries[i].action);

        Draw.svgElem ("circle", {
            "class": "iconCircle",
            "r" : "14"
        }, entryGroup);
        
        Draw.svgElem ("image", {
            "href": entries[i].icon,
            "x": "-8",
            "y": "-8",
            "height": "16",
            "width": "16"
        }, entryGroup);

    }
    return g;
};

Draw.menu = function (alignment, entries, parent) {
    var g = Draw.visibleMenu (alignment, entries, parent);
    g.setAttribute ("class", "menu hidden");

    parent.addEventListener ("click", Draw.activate.bind(null, g));
    return g;
};
Draw.straightLine = function (start, end, lnClass, parent) {
    var line = Draw.svgElem("g", {
        "class": lnClass
    }, parent);

    Draw.svgElem("line", {
        "x1": end.x,
        "y1": end.y,
        "x2": start.x,
        "y2": start.y
    }, line);

    return line;
};
Draw.quadrupleAngledLine = function (start, end, hspace, vspace, lnClass, parent) {
    var yPause = end.y >= start.y ? start.y + vspace : start.y - vspace;

    return Draw.svgElem ("path", {
        "class": lnClass,
        "d" : "M" + start.x + " " + start.y +
            "H" + (start.x + hspace) +
            "V" + yPause +
            "H" + (end.x - hspace) +
            "V" + end.y +
            "H" + end.x
    }, parent);
};
Draw.doubleAngledLine = function (start, end, hspace, vspace, lnClass, parent){
/* Creates an angled line like so:
             end
           /
     _____/
    /
start  
*/
    var upturn, plateuWidth;
    var y = start.y;
    var x = start.x;
    if (end.y > start.y) {
        var plateuHeight = vspace / 2 + start.y
    }
    else if (end.y < start.y) {
        plateuHeight = 0 - vspace / 2 + start.y;
    }
    else {
        plateuHeight = start.y;
    }
        
    var spacing = end.x > start.x ? hspace : 0 - hspace;
    //upturn = (Math.abs(end.y - start.y) * 2) / this.VERTICALSPACING;
    //upturn = spacing / upturn + start.x;
    upturn = spacing / 2 + start.x;
    plateuWidth = end.x - start.x - spacing;
    
    var group = Draw.svgElem ("g", {
        "class": lnClass
    }, parent);

    Draw.svgElem ("line", {
        "x1": start.x, 
        "y1": start.y, 
        "x2": upturn, 
        "y2": plateuHeight
    }, group)
    
    Draw.svgElem ("line", {
        "x1": upturn, 
        "y1": plateuHeight, 
        "x2": upturn + plateuWidth, 
        "y2": plateuHeight
    }, group);
    
    Draw.svgElem ("line", {
        "x1": upturn + plateuWidth, 
        "y1": plateuHeight, 
        "x2": end.x, 
        "y2": end.y
    }, group);
    
    return group;
};

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
