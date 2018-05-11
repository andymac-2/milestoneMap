'use strict'


var Loader = function (parent) {
    //view
    this.elem = Draw.htmlElem ("div", {
        "class": "milestoneMapContainer"
    }, parent);

    this.map;
    this.file;
    this.parent = parent;

    Util.throttleEvent (window, "resize", this.draw.bind(this), 100);

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

    this.map.reportSelectors();
    reportSegment.body.appendChild(this.map.elemReportSelectors);

    var printSegment = Draw.menuBarSegment ("Print", menubar);
    Draw.iconBar ([{
        icon: "icons/print.svg",
        action: this.print.bind(this)
    }], {}, printSegment.body);
    this.printSizeSelector ({
        "class": "pageSizeSelector"
    }, printSegment.body);

    var aboutSegment = Draw.menuBarSegment ("About", menubar);
    Draw.iconBar ([{
        icon: "icons/info.svg",
        action: () => alert(Loader.aboutText)
    }], {}, aboutSegment.body);

    this.map.maxHeight = window.innerHeight - Draw.getElemHeight(menubar) - 5;
    this.elem.appendChild(this.map.elemContainer);
    this.map.draw();
};


// correspond to Loader.PAGESIZENAMES
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
Loader.A3SIZE = Loader.PAGESIZES[5];
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
        this.parent.innerHTML = mMap.printElem.innerHTML;
        window.print();
        this.parent.innerHTML = "";
        this.parent.appendChild(this.elem);
        
        //newWindow.close();
    }
    catch (err) {
        Util.allertErr(err);
    }
};


Loader.aboutText = `Milestone Map, Version: ` + VERSION + `

Copyright (c) 2018 Andrew Pritchard, all rights reserved.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
