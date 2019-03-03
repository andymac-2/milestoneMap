'use strict'

// maybe better as a function rather than a class

/** @constructor
    @struct 
    @param {Element=} parentMain*/
var DateHeader = function (mMap, parentHeader, parentMain) { 
    // view

    /** @type {Element} */ 
    this.elem = Draw.svgElem("g", {
        "class": "dateHeader"
    }, parentHeader);
    /** @type {Element} */ 
    this.bgElem =Draw.svgElem ("g", {}, this.elem);
    /** @type {Element} */ 
    this.fgElem = Draw.svgElem ("g", {}, this.elem);
    /** @type {Element} */ 
    this.elemPageBackground = Draw.svgElem ("g", {
        "class": "dateHeader"
    }, parentMain);

    /** @type {Draw.vertResizableForeign} */ this.headingBox;
    /** @type {Element} */ this.nonTitle;


    // view model
    /** @type {MilestoneMap} */ this.mMap = mMap;
    /** @type {number} */ this.titleWidth = 0;
    /** @type {number} */ this.endy;
    /** @type {number} */ this.rowHeight;


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

DateHeader.DATEYOFFSET = -5;
DateHeader.ROWMARGIN = 20;
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
    this.fgElem.setAttribute(
        "transform", "translate(0 " + this.headingBox.height + ")");
    this.bgElem.setAttribute(
        "transform", "translate(0 " + this.headingBox.height + ")");
    
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

    var y = DateHeader.ROWMARGIN;
    for (var i = 0; i < rows.length - 2; i++) {
        this.drawRow(y, DateHeader.ROWHEIGHT, rows[i],
                     this.drawHighlightedBox.bind(this));
        y += DateHeader.ROWHEIGHT;
    }

    if (rows.length > 1) {
        this.drawRow(y, "100%", rows[rows.length - 2],
                     this.drawHighlightedBox.bind(this));
        this.drawRow(y, "100%", rows[rows.length - 2],
                     this.drawBGBox.bind(this));
        y += DateHeader.ROWHEIGHT;
        
        this.drawRow(y, DateHeader.ROWHEIGHT, rows[rows.length - 1],
                     this.drawOutlineBox.bind(this));
        this.endy = y + DateHeader.ROWHEIGHT;
    }
    else {
        this.drawRow(y, "100%", rows[0],
                     this.drawHighlightedBox.bind(this));
        this.drawRow(y, "100%", rows[0],
                     this.drawBGBox.bind(this));
        this.endy = y + DateHeader.ROWHEIGHT;
    }
    this.rowHeight = this.endy;
    this.endy += DateHeader.BUFFERHEIGHT + this.headingBox.height;
    
    Draw.svgElem ("rect", {
        "x" : 0, "y": 0,
        "width": this.mMap.getSideBarWidth(),
        "height": "100%",
        "class": "whiteBackground"
    }, this.bgElem);

    Draw.svgElem ("rect", {
        "x" : 0, "y": 0,
        "width": this.mMap.getSideBarWidth(),
        "height": "100%",
        "class": "whiteBackground"
    }, this.elemPageBackground);
};
DateHeader.prototype.drawBGBox = function (x1, x2, y1, height, text, cls) {
    Draw.svgElem ("rect", {
        "class": cls,
        "height": "100%",
        "y": "0",
        "x": x1,
        "width": x2 - x1
    }, this.elemPageBackground);
};
DateHeader.prototype.drawHighlightedBox = function (x1, x2, y1, height, text, cls) {
    Draw.svgElem ("rect", {
        "class": cls,
        "height": height,
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
DateHeader.prototype.drawOutlineBox = function (x1, x2, y1, height, text, cls) {
    var y2 = y1 + height;
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
DateHeader.prototype.drawRow = function (y1, height, interval, drawfunc) {
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
        
        drawfunc (x1, x2, y1, height, text, num % 2 === 0 ? "even": "odd");
        num ++;
    };
};

DateHeader.TITLEMARGIN = 60;
DateHeader.PARAGRAPHMARGIN = 4;
DateHeader.prototype.drawTitle = function () {
    var x = DateHeader.REPORTMARGIN + DateHeader.TITLEMARGIN;
    var g = Draw.svgElem ("g", {
        "transform": "translate(" + x + " 0)",
    }, this.fgElem);

    var usableWidth = this.mMap.width - 
        2 * DateHeader.REPORTMARGIN - 2 * DateHeader.TITLEMARGIN;
    this.headingBox = new Draw.vertResizableForeign (
        usableWidth, DateHeader.PARAGRAPHMARGIN, {}, g);
    
    new Draw.editableParagraph (this.mMap.name, {
        unclicker: this.mMap.unclicker,
        defaultText: "Untitled",
        onchange: this.mMap.modifyName.bind(this.mMap)
    }, {
        "class": "mMapTitle"
    }, this.headingBox.container);
    
    this.headingBox.update();
    this.fgElem.setAttribute(
        "transform", "translate(0 " + this.headingBox.height + ")");
    this.headingBox.elem.addEventListener (
        "verticalResize", this.adjustHeight.bind(this));

    return this.headingBox.height;
};
DateHeader.prototype.adjustHeight = function () {
    var oldHeight = this.endy;
   //   this.headingBox.elem.setAttribute(
   //     "transform", "translate(0 " + this.headingBox.height + ")");

    this.fgElem.setAttribute(
        "transform", "translate(0 " + this.headingBox.height + ")");
    this.bgElem.setAttribute(
        "transform", "translate(0 " + this.headingBox.height + ")");
    this.endy = this.getHeight();
    this.reflowUp();
};
DateHeader.prototype.getHeight = function () {
    return this.rowHeight + DateHeader.BUFFERHEIGHT + this.headingBox.height;
};
DateHeader.prototype.getReportLineStartY = function () {
    return this.headingBox.height + DateHeader.ROWMARGIN;
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
            "transform": "translate(10 " + DateHeader.DATEYOFFSET + ")",
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
                DateHeader.DATEYOFFSET  + ")",
            "class": "mMapEdgeDate"
        }
    }, this.mMap.end);
};

DateHeader.REPORTMARGIN = 250
DateHeader.prototype.drawReports = function () {
    var x = this.mMap.width - DateHeader.REPORTMARGIN;
    this.mMap.currReport.drawHeader ({
        "transform": "translate(" + x + ", " + DateHeader.DATEYOFFSET  + ")"
    }, this.fgElem);

    if (this.mMap.currReport !== this.mMap.cmpReport) {
        this.mMap.cmpReport.drawHeader ({
            "transform": "translate(" + DateHeader.REPORTMARGIN + 
                ", " + DateHeader.DATEYOFFSET  + ")"
        }, this.fgElem);
    }   
};

DateHeader.prototype.reflowUp = function () {
    this.mMap.reflow();
}
