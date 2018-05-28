'use strict'

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
Draw.bowedLine = function (start, end, lnClass, parent) {
    var ybow = (start.x - end.x) * 0.1;
    ybow = Util.clamp (-45, 45, ybow);
    var xbow = ybow * 4;
    return Draw.svgElem ("path", {
        "class": lnClass,
        "d" : "M" + start.x + " " + start.y + " " +
            "C" + (start.x - xbow) + " " + (start.y + ybow) + " " +
            (end.x + xbow) + " " + (end.y + ybow) + " " +
            end.x + " " + end.y
    }, parent);
};

// create an s shaped curve, going to the right of the start and into the left of end.
// strength indicates how curved the line will be
Draw.sLine = function (start, end, strength, lnClass, parent) {
    return Draw.svgElem ("path", {
        "class": lnClass,
        "d" : "M" + start.x + " " + start.y + " " +
            "C" + (start.x + strength) + " " + start.y + " " +
            (end.x - strength) + " " + end.y + " " +
            end.x + " " + end.y
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
