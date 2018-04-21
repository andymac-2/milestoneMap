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
DateHeader.zeroDayOfMonth = function (date) {
    date.setUTCDate(0);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};
DateHeader.zeroDayOfWeek = function (date) {
    var dayOfWeek = date.getUTCDay();
    var dayOfMonth = date.getUTCDate();
    date.setUTCDate(dayOfMonth- dayOfWeek);
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
    var onejan = new Date(date.getFullYear(),0,1);
    var millisecsInDay = 86400000;
    return Math.ceil((((date - onejan) /millisecsInDay) + onejan.getDay()+1)/7);
};
DateHeader.getShortMonth = function (date) {
    var date2 = new Date (date);
    date2.setUTCDate(date.getUTCDate() + 1);
    return date2.toLocaleDateString("en-GB", {"month": "short"});
};

DateHeader.prototype.restore = function () {
    this.draw();
};

DateHeader.prototype.draw = function () {
    this.bgElem.innerHTML = "";

    var cursor = DateHeader.zeroDayOfMonth(new Date (this.mMap.start));
    var num = 0;
    
    while(cursor.valueOf() <= this.mMap.end) {
        var x = this.mMap.getXCoord(cursor);
        var text = DateHeader.getShortMonth(cursor);
        var width = this.mMap.getXCoord(DateHeader.incrementMonth(cursor)) - x;
        
        Draw.svgElem ("rect", {
            "class": num % 2 === 0 ? "even": "odd",
            "height": "25",
            "y": "0",
            "x": x,
            "width": width
        }, this.bgElem);

        Draw.svgElem ("text", {
            "y": "18",
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
            "y": "25",
            "x": x,
            "width": width
        }, this.bgElem);

        Draw.svgElem ("text", {
            "y": "43",
            "x": x + width / 2,
            "text-anchor": "middle"
        }, this.fgElem).textContent = text;

        num ++;
    };
};


