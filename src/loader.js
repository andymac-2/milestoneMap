'use strict'


var Loader = function (parent) {
    //view
    this.elem = Draw.htmlElem ("div", {
        "class": "milestoneMapContainer"
    }, parent);

    this.map;
    this.file;

    this.newFile();
};

Loader.prototype.save = function () {
    var string = JSON.stringify(this.map.save(), null, "\t");
    Util.download (this.map.name + ".json", string, "application/json",
                   this.elem);
};

Loader.prototype.restore = function (string) {
    var obj = JSON.parse(string);
    this.map = new MilestoneMap(obj);
};

Loader.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    var menubar = Draw.htmlElem ("div", {
        "class": "menubar"
    }, this.elem);

    var fileSegment = Draw.menuBarSegment("File", menubar);
    Draw.iconBar ([{
        icon: "icons/new.svg",
        action: this.newFile.bind(this)
    }, {
        icon: "icons/open.svg",
        action: this.loadFile.bind(this)
    }, {
        icon: "icons/save.svg",
        action: this.save.bind(this)
    },  {
        icon: "icons/exportCSV.svg",
        action: this.exportCSV.bind(this)
    }, {
        icon: "icons/import.svg",
        action: this.importCSVReport.bind(this)
    }], {}, fileSegment.body);

    var programmeSegment = Draw.menuBarSegment("Programme", menubar);
    Draw.iconBar([{
        icon: "icons/plus.svg",
        action: this.map.newProgramme.bind(this.map)
    }], {}, programmeSegment.body);

    var reportSegment = Draw.menuBarSegment("Report", menubar);
    Draw.iconBar ([{
        icon: "icons/plus.svg",
        action: this.newReport.bind(this)
    }, {
        icon: "icons/delete.svg",
        action: this.deleteCurrReport.bind(this)
    }], {}, reportSegment.body);  
    
    this.reportSelector (
        "Current:", this.modifyCurrReport.bind(this), {
            "class": "reportSelector"
        }, reportSegment.body);
    this.reportSelector (
        "Baseline:", this.modifyCmpReport.bind(this), {
            "class": "reportSelector"
        }, reportSegment.body);

    var printSegment = Draw.menuBarSegment ("Print", menubar);
    Draw.iconBar ([{
        icon: "icons/print.svg",
        action: this.print.bind(this)
    }], {}, printSegment.body);
    this.printSizeSelector ({
        "class": "pageSizeSelector"
    }, printSegment.body);

    var versionSegment = Draw.menuBarSegment ("Version: " + VERSION +
        " \xA9 Andrew Pritchard 2018", menubar);
  
    this.elem.appendChild(this.map.scrollbox);
    var height = window.innerHeight - Draw.getElemHeight(menubar) - 10;
    this.map.scrollbox.setAttribute("style", "max-height:" + height + "px;");
    
    this.map.draw();
};
Loader.prototype.reportSelector = function (text, onchange, attrs, parent) {
    var entries = this.map.reports.map (report => report.getMenuText());
    return Draw.dropDownSegment (text, onchange, entries, attrs, parent);
};

// correspond to Loader.PAGESIZENAMES
Loader.A3SIZE = {height: 297, width: 420};
Loader.PAGEMARGIN = 35;
Loader.PAGESIZES = [
    {height: 1682, width: 2378},
    {height: 1189, width: 1682},
    {height: 841, width: 1189},
    {height: 594, width: 841},
    {height: 420, width: 594},
    {height: 297, width: 420},
    {height: 210, width: 297}
].map(elem => {
    return {
        height: elem.height - Loader.PAGEMARGIN * 2,
        width: elem.width - Loader.PAGEMARGIN * 2,
    };
});
// correspond to Loader.PAGESIZES
Loader.PAGESIZENAMES = [
    "4A0", "2A0", "A0", "A1", "A2", "A3", "A4"
];
Loader.prototype.printSizeSelector = function (attrs, parent) {
    var onchange = (evt) => {
        this.map.pageSize = Loader.PAGESIZES[evt.currentTarget.value];
    }
    Draw.dropDownSegment (
        "Page Size:", onchange, Loader.PAGESIZENAMES, attrs, parent);
};

// modifications


// user events
Loader.prototype.modifyCurrReport = function (evt) {
    this.map.modifyCurrReport (evt.currentTarget.value);
    this.map.draw ();
};
Loader.prototype.modifyCmpReport = function (evt) {
    this.map.modifyCmpReport (evt.currentTarget.value);
    this.map.draw ();
};
Loader.prototype.newReport = function () {
    this.map.addReport ({"name": "New Report", "date": this.map.defaultDate()});
    this.draw();
};
Loader.prototype.deleteCurrReport = function () {
    this.map.currReport.deleteThis();
    this.draw();
};

Loader.prototype.newFile = function () {
    var now = MilestoneMap.prototype.defaultDate();
    var twoMonths = 60 * 24 * 60 * 60 * 1000;
    var twoMonthsAgo = now - twoMonths;
    var date = new Date(twoMonthsAgo);
    var nextYear = date.setUTCFullYear(date.getUTCFullYear() + 1).valueOf(); 

    this.map = new MilestoneMap ({
        name: "New Map",
        start: twoMonthsAgo,
        end: nextYear,
        programmes: [],
        projects: [],
        milestones: [],
        msAtReports: [],
        reports: [
            {name: "Baseline", date:now},
        ],
        dependencies: [],
        currReport: 0,
        cmpReport: 0
    });
    this.draw();
};

Loader.prototype.loadFile = function () {
    var restoreDraw = (string) => {
        this.restore(string);
        this.draw();
    };
    
    Util.upload (this.elem, restoreDraw, ".json");
};
Loader.prototype.importCSVReport = function () {
    var restoreDraw = (string) => {
        try {
            var arr = Util.parseCSV (string);
            this.map.addReportFromCSV (arr);
            this.draw();
        }
        catch (err) {
            Util.allertErr(err);
        }
    };
    
    Util.upload (this.elem, restoreDraw, ".csv");
};

Loader.prototype.exportCSV = function () {
    var string = this.map.exportCSVMilestones();
    Util.download (this.map.name + ".csv", string, "text/csv",
                   this.elem);
};

Loader.prototype.print = function () {
    var mMap = new MilestoneMap (this.map.save(), this.map.pageSize);
    
    try {
        mMap.drawPrint();
        var newWindow = window.open ("", "_blank", "");
        
        newWindow.document.body.innerHTML = mMap.printElem.outerHTML;
        newWindow.print();
        newWindow.close();
    }
    catch (err) {
        Util.allertErr(err);
    }
};
