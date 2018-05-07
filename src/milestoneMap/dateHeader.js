'use strict'

// maybe better as a function rather than a class
var DateHeader = function (mMap, parent) { 
    // view
    this.elem = Draw.svgElem("g", {
        "class": "dateHeader"
    }, parent);
    this.bgElem =Draw.svgElem ("g", {}, this.elem);
    this.fgElem = Draw.svgElem ("g", {}, this.elem);

    // view model
    this.mMap = mMap;
    this.endy;

    this.draw();
};

// zero dates
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
DateHeader.zeroDecade = function (date) {
    var year = date.getUTCFullYear();
    date.setUTCFullYear (year - year % 10);
    DateHeader.zeroDateOfYear(date);
    return date;
};

// increment dates
DateHeader.incrementDay = function (date) {
    date.setUTCDate(date.getUTCDate() + 1);
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
DateHeader.incrementYear = function (date) {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    return date;
};
DateHeader.incrementDecade = function (date) {
    date.setUTCFullYear(date.getUTCFullYear() + 10);
    return date;
};

// names of headings
DateHeader.getDate = function (date) {
    return date.getUTCDate();
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
    
    return  "" + Math.ceil(
        (closestThursday.valueOf() - oneJan.valueOf()) /
            millisecsInWeek);
};
DateHeader.getShortMonth = function (date) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[date.getUTCMonth()];
};
DateHeader.getYear = function (date) {
    return "" + date.getUTCFullYear();
};
DateHeader.getDecade = function (date) {
    var year = date.getUTCFullYear();
    var decade = year - (year % 10);
    return ("" + decade + "'s");
};

DateHeader.TITLEY = 30;
DateHeader.ROWY = 50;
DateHeader.ROWHEIGHT = 20;
DateHeader.TEXTOFFSET = 15;
DateHeader.BUFFERHEIGHT = 10;


DateHeader.TWENTYDAYS = 1728000000;
DateHeader.THIRTYWEEKS = 18144000000;
DateHeader.FOURYEARS = 126144000000;
DateHeader.SIXYEARS = 189216000000;

// density calculated by <length of period in ms> / <min width of
// interval in px>
DateHeader.MAXDAYDENSITY = 4320000;
DateHeader.MAXWEEKDENSITY = 30240000;
DateHeader.MAXMONTHDENSITY = 89280000;
DateHeader.prototype.draw = function () {
    this.bgElem.innerHTML = "";
    
    // drawing the header
    this.drawTitle();
    this.drawEndDates();
    this.drawReports();
    
    // drawing the rows
    var rows = [];
    var interval = this.mMap.end - this.mMap.start;
    var density = interval / this.mMap.width;
    if (interval > DateHeader.SIXYEARS) {
        rows.push (DateHeader.DECADES);
    }
    if (interval > DateHeader.THIRTYWEEKS) {
        rows.push(DateHeader.YEARS);
    }
    if (interval > DateHeader.TWENTYDAYS &&
        density < DateHeader.MAXMONTHDENSITY)
    {
        rows.push(DateHeader.MONTHS);
    }
    if (density < DateHeader.MAXWEEKDENSITY){
        rows.push(DateHeader.WEEKS);
    }
    if (density < DateHeader.MAXDAYDENSITY){
        rows.push(DateHeader.DAYS);
    }

    var y = DateHeader.ROWY;
    for (var i = 0; i < rows.length - 2; i++) {
        this.drawRow(y, y + DateHeader.ROWHEIGHT, rows[i],
                     this.drawHighlightedBox.bind(this));
        y += DateHeader.ROWHEIGHT;
    }

    // TODO all calls to Draw.getElemHEight replaced with something printer friendly
    if (rows.length > 1) {
    this.drawRow(y, this.mMap.height, rows[rows.length - 2],
                 this.drawHighlightedBox.bind(this));
        y += DateHeader.ROWHEIGHT;
    
    this.drawRow(y, y + DateHeader.ROWHEIGHT, rows[rows.length - 1],
                 this.drawOutlineBox.bind(this));
        this.endy = y + DateHeader.ROWHEIGHT;
    }
    else {
        this.drawRow(y, this.mMap.height, rows[0],
                 this.drawHighlightedBox.bind(this));
        this.endy = y + DateHeader.ROWHEIGHT;
    }

    this.endy += DateHeader.BUFFERHEIGHT;
    
    Draw.svgElem ("rect", {
        "x" : "0", "y": "0",
        "width": this.mMap.getSideBarWidth(),
        "height": this.mMap.height,
        "class": "whiteBackground"
    }, this.bgElem)
};

DateHeader.prototype.drawHighlightedBox = function (x1, x2, y1, y2, text, cls) {
    Draw.svgElem ("rect", {
        "class": cls,
        "height": y2 - y1,
        "y": y1,
        "x": x1,
        "width": x2 - x1
    }, this.bgElem);

    Draw.svgElem ("text", {
        "class": "majorRowText",
        "y": y1 + DateHeader.TEXTOFFSET,
        "x": (x1 + x2) /2,
        "text-anchor": "middle"
    }, this.bgElem).textContent = text;
};
DateHeader.prototype.drawOutlineBox = function (x1, x2, y1, y2, text, cls) {
    Draw.svgElem ("line", {
        "class": "dateHeaderSeparator",
        "x1": x1, "y1": y1 + 3,
        "x2": x1, "y2": y2 - 3
    }, this.bgElem);

    Draw.svgElem ("text", {
        "class": "minorRowText",
        "y": y1 + DateHeader.TEXTOFFSET,
        "x": (x1 + x2) /2,
        "text-anchor": "middle"
    }, this.bgElem).textContent = text;
};

DateHeader.DAYS = 0;
DateHeader.WEEKS = 1;
DateHeader.MONTHS = 2;
DateHeader.YEARS = 3;
DateHeader.DECADES = 4;
DateHeader.prototype.drawRow = function (y1, y2, interval, drawfunc) {
    switch (interval) {
    case DateHeader.DAYS:
        var zero = DateHeader.zeroTimeOfDay;
        var increment = DateHeader.incrementDay;
        var name = DateHeader.getDate;
        break;
    case DateHeader.WEEKS:
        zero = DateHeader.zeroDayOfWeek;
        increment = DateHeader.incrementWeek;
        name = DateHeader.getWeekOfYear;
        break;
    case DateHeader.MONTHS:
        zero = DateHeader.zeroDayOfMonth;
        increment = DateHeader.incrementMonth;
        name = DateHeader.getShortMonth;
        break;
    case DateHeader.YEARS:
        zero = DateHeader.zeroDateOfYear;
        increment = DateHeader.incrementYear;
        name = DateHeader.getYear;
        break;
    case DateHeader.DECADES:
        zero = DateHeader.zeroDecade;
        increment = DateHeader.incrementDecade;
        name = DateHeader.getDecade;
    }

    var cursor = zero(new Date (this.mMap.start));
    var num = 0;
    
    while(cursor.valueOf() <= this.mMap.end) {
        var text = name(cursor);
        
        var x1 = this.mMap.getXCoord(cursor);
        var x2 = this.mMap.getXCoord(increment(cursor));
        
        drawfunc (x1, x2, y1, y2, text, num % 2 === 0 ? "even": "odd");
        num ++;
    };
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

DateHeader.TWODAYS = 172800000;
DateHeader.prototype.drawEndDates = function () {
    var g = Draw.svgElem ("g", {}, this.fgElem);
    new Draw.svgDateInput ({
        unclicker: this.mMap.unclicker,
        onchange: this.mMap.modifyStartDate.bind(this.mMap),
        parent: g,
        max: this.mMap.end - DateHeader.TWODAYS,
        alignment: Draw.ALIGNLEFT,
        attrs: {
            "transform": "translate(10 " + DateHeader.TITLEY + ")",
            "class":  "mMapEdgeDate"
        }
    }, this.mMap.start);

    g = Draw.svgElem ("g", {}, this.fgElem);
    new Draw.svgDateInput ({
        unclicker: this.mMap.unclicker,
        onchange: this.mMap.modifyEndDate.bind(this.mMap),
        parent: g,
        min: this.mMap.start + DateHeader.TWODAYS,
        alignment: Draw.ALIGNRIGHT,
        attrs: {
            "transform": "translate(" + 
                (this.mMap.width - 10) + " " +
                DateHeader.TITLEY + ")",
            "class": "mMapEdgeDate"
        }
    }, this.mMap.end);
};

DateHeader.prototype.drawReports = function () {
    var x = this.mMap.width - 250;
    this.mMap.currReport.drawHeader ({
        "transform": "translate(" + x + ", 25)"
    }, this.fgElem);

    if (this.mMap.currReport !== this.mMap.cmpReport) {
        this.mMap.cmpReport.drawHeader ({
            "transform": "translate(250, 25)"
        }, this.fgElem);
    }   
};
