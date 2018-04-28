'use strict'

// maybe better as a function rather than a class
var DateHeader = function (mMap) { 
    // view
    this.bgElem = Draw.svgElem ("g", {}, mMap.bg);
    this.fgElem = Draw.svgElem ("g", {}, mMap.fg);

    // view model
    this.mMap = mMap;

    this.restore();
};

DateHeader.zeroTimeOfDay = function (date) {
    date.setUTCHours(0, 0, 0, 0);
    return date;
};
DateHeader.zeroDateOfYear = function (date) {
    date.setUTCMonth (0, 1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};
DateHeader.zeroDayOfMonth = function (date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};
DateHeader.zeroDayOfWeek = function (date) {
    // subtract 1 because Monday is the first day of an ISO week.
    var dayOfWeek = (date.getUTCDay() - 1) % 7;
    var dayOfMonth = date.getUTCDate();
    date.setUTCDate(dayOfMonth - dayOfWeek);
    return date;
};
DateHeader.incrementWeek = function (date) {
    date.setUTCDate(date.getUTCDate() + 7);
    return date;
};
DateHeader.incrementMonth = function (date) {
    date.setUTCMonth(date.getUTCMonth() + 1);
    return date;
};
DateHeader.getWeekOfYear = function (date) {
    // JS weeks start with Sun, ISO dates start with Mon, so we sub 1;
    var dayOfWeek = (date.getUTCDay() - 1) % 7;
    // if Mon = 0, then Thu = 3
    var thursday = 3 - dayOfWeek;
    
    var closestThursday = new Date(date.valueOf());
    DateHeader.zeroTimeOfDay(closestThursday);
    closestThursday.setUTCDate(date.getUTCDate() + thursday);

    var oneJan = new Date(closestThursday.getUTCFullYear(),0,1);
    var millisecsInWeek = 604800000;
    
    return  Math.ceil(
        (closestThursday.valueOf() - oneJan.valueOf()) /
            millisecsInWeek);
};
DateHeader.getShortMonth = function (date) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[date.getUTCMonth()];
};

DateHeader.prototype.restore = function () {
    this.draw();
};

DateHeader.TITLEY = 30;
DateHeader.ROW1Y = 40;
DateHeader.ROW2Y = 65;
DateHeader.TEXTOFFSET = 18;
DateHeader.prototype.draw = function () {
    this.bgElem.innerHTML = "";
    
    // drawing the header
    this.drawTitle();
    this.drawEndDates();
    this.drawReports();


    
    // drawing the months
    var cursor = DateHeader.zeroDayOfMonth(new Date (this.mMap.start));
    var num = 0;
    
    while(cursor.valueOf() <= this.mMap.end) {
        var x = this.mMap.getXCoord(cursor);
        var text = DateHeader.getShortMonth(cursor);
        var width = this.mMap.getXCoord(DateHeader.incrementMonth(cursor)) - x;
        
        Draw.svgElem ("rect", {
            "class": num % 2 === 0 ? "even": "odd",
            "height": DateHeader.ROW2Y - DateHeader.ROW1Y,
            "y": DateHeader.ROW1Y,
            "x": x,
            "width": width
        }, this.bgElem);

        Draw.svgElem ("text", {
            "y": DateHeader.ROW1Y + DateHeader.TEXTOFFSET,
            "x": x + width / 2,
            "text-anchor": "middle"
        }, this.fgElem).textContent = text;

        num ++;
    };

    cursor = DateHeader.zeroDayOfWeek(new Date (this.mMap.start));
    num = 0;
    
    while(cursor.valueOf() <= this.mMap.end) {
        x = this.mMap.getXCoord(cursor);
        text = DateHeader.getWeekOfYear(cursor);
        width = this.mMap.getXCoord(DateHeader.incrementWeek(cursor)) - x;
        
        Draw.svgElem ("rect", {
            "class": num % 2 === 0 ? "even": "odd",
            "height": "100%",
            "y": DateHeader.ROW2Y,
            "x": x,
            "width": width
        }, this.bgElem);

        Draw.svgElem ("text", {
            "y": DateHeader.ROW2Y + DateHeader.TEXTOFFSET,
            "x": x + width / 2,
            "text-anchor": "middle"
        }, this.fgElem).textContent = text;

        num ++;
    };

    this.endy = DateHeader.ROW2Y * 2 - DateHeader.ROW1Y;
};
DateHeader.prototype.drawRow1 = function () {
    
};

DateHeader.prototype.drawTitle = function () {
    var g = Draw.svgElem ("g", {}, this.fgElem);
    new Draw.svgTextInput (
        this.mMap.name, Draw.ALIGNCENTER, this.mMap.unclicker,
        this.mMap.modifyName.bind(this.mMap), {
            "transform": "translate(" +
                (this.mMap.width / 2) + " " +
                DateHeader.TITLEY + ")",
            "class": "mMapTitle"
        }, g);
};

DateHeader.prototype.drawEndDates = function () {
    var g = Draw.svgElem ("g", {}, this.fgElem);
    new Draw.svgDateInput (
        this.mMap.start, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.mMap.modifyStartDate.bind(this.mMap), {
            "transform": "translate(10 " + DateHeader.TITLEY + ")",
            "class":  "mMapEdgeDate"
        }, g);

    g = Draw.svgElem ("g", {}, this.fgElem);
    new Draw.svgDateInput (
        this.mMap.end, Draw.ALIGNRIGHT, this.mMap.unclicker,
        this.mMap.modifyEndDate.bind(this.mMap), {
            "transform": "translate(" + 
                (this.mMap.width - 10) + " " +
                DateHeader.TITLEY + ")",
            "class": "mMapEdgeDate"
        }, g);
};

DateHeader.prototype.drawReports = function () {
    this.mMap.currReport.drawHeader ("Current", {
        "transform": "translate(250, 15)"
    }, this.fgElem);

    this.mMap.cmpReport.drawHeader ("Baseline", {
        "transform": "translate(500, 15)"
    }, this.fgElem);
    
};
