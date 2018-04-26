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

Draw.menuBarSegment = function (name, entries, parent) {
    var svg = Draw.svgElem ("svg", {
        "class": "menuBarSegment",
        "width": Draw.MENUSPACING * (entries.length),
        "height": "55"
    }, parent)

    var menu = Draw.visibleMenu (Draw.ALIGNLEFT, entries, svg);
    menu.setAttribute ("transform", "translate (0, 35)");

    Draw.svgElem ("text", {
        "class": "menuBarHeader",
        "text-anchor": "start",
        "transform": "translate(12 13)"
    }, svg).textContent = name;

    return svg
};
