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
    case Draw.ALIGNRIGHT:
        x = 0 - (entries.length + 1) * Draw.MENUSPACING;
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
        
        var image = Draw.svgElem ("image", {
            "x": "-8",
            "y": "-8",
            "height": "16",
            "width": "16"
        }, entryGroup);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', entries[i].icon);

    }
    return g;
};

Draw.menu = function (alignment, unclicker, entries, attrs, parent) {
    var menu = Draw.activeOnClickElem (
        g => g.innerHTML = "",
        g => {
            g.innerHTML = ""
            Draw.visibleMenu (alignment, entries, g);
        },
        unclicker, attrs, parent);
    return menu;
};

Draw.menuBarSegment = function (name, parent) {
    var elem = Draw.elem ("span", {
        "class": "menuBarSegment",
    }, parent);
    
    var header = Draw.elem ("div", {
        "class": "menuBarHeader"
    }, elem).textContent = name;

    var body = Draw.elem ("div", {
        "class": "menuBarContent"
    }, elem);

    return {elem: elem, body: body};
};

Draw.ICONBARHEIGHT = 40;
Draw.iconBar = function (entries, attrs, parent) {
    var container = Draw.elem ("span", attrs, parent);
    
    var svg = Draw.svgElem ("svg", {
        "width": Draw.MENUSPACING * (entries.length),
        "height": Draw.ICONBARHEIGHT
    }, container);

    var menu = Draw.visibleMenu (Draw.ALIGNLEFT, entries, svg);
    menu.setAttribute ("transform", "translate (0, 20)");

    return container;
};

Draw.dropDownSegment = function (name, onchange, entries, attrs, parent) {
    var elem = Draw.elem("span", attrs, parent);

    Draw.elem("div", {
        "class": "dropdownSegmentHeading"
    }, elem).textContent = name;
    
    var select = Draw.elem ("select", {
        "class": "dropdownSegmentDropdown"
    }, elem);
    select.addEventListener ("change", onchange);

    Draw.elem ("option", {
        "selected": "",
        "disabled": "",
        "hidden": ""
    }, select).textContent = "Please choose:";

    for (var i = 0; i < entries.length; i++) {
        Draw.elem ("option", {
            "value": i,
        }, select).textContent = entries[i];
    };
    
    return elem;
};
