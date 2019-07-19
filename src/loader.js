'use strict'

/** @constructor
    @struct */
var Loader = function (parent) {
    parent.innerHTML = "";
    //view
    /** @type {Element} */
    this.elem = Draw.htmlElem("div", {
        "class": "milestoneMapContainer"
    }, parent);

    /** @type {MilestoneMap} */ this.map;
    /** @type {Element} */ this.parent = parent;
    /** @type {Element} */ this.console;
    /** @type {SaveLoad} */ this.saveLoad = new SaveLoad();

    this.newFile();
};

Loader.prototype.save = function () {
    var string = JSON.stringify(this.map.save(), null, "\t");
    this.console.textContent = "Saving..."
    this.saveLoad.save((fileResource) => {
        if (fileResource) {
            this.console.textContent = "Saved as: " + fileResource["name"];
        }
        else {
            this.console.textContent = "Error saving file"
        }
    }, this.map.name, string);
    // Util.download (this.map.name + ".json", string, "application/json",
    //                this.elem);
};
Loader.prototype.download = function () {
    var string = JSON.stringify(this.map.save(), null, "\t");
    Util.download(this.map.name + ".json", string, "application/json",
        this.elem);
};

Loader.prototype.restore = function (obj) {
    this.map = new MilestoneMap(obj);
};

Loader.prototype.draw = function () {
    this.elem.innerHTML = "";

    this.console = Draw.htmlElem("div", {
        "class": "console"
    }, this.elem);

    var menubar = Draw.htmlElem("div", {
        "class": "menubar"
    }, this.elem);

    var fileSegment = Draw.menuBarSegment("File", menubar);
    Draw.iconBar([{
        icon: "icons/new.svg",
        action: this.newFile.bind(this),
        mouseover: () => this.console.textContent = "New file"
    }, {
        icon: "icons/open.svg",
        action: this.loadFile.bind(this),
        mouseover: () => this.console.textContent = "Open file from Google Drive"
    }, {
        icon: "icons/save.svg",
        action: this.save.bind(this),
        mouseover: () => this.console.textContent = "Save file to google drive"
    }, {
        icon: "icons/download.svg",
        action: this.download.bind(this),
        mouseover: () => this.console.textContent = "Download file"
    }, {
        icon: "icons/upload.svg",
        action: this.uploadFile.bind(this),
        mouseover: () => this.console.textContent = "Upload file"
    }, {
        icon: "icons/exportCSV.svg",
        action: this.exportCSV.bind(this),
        mouseover: () => this.console.textContent = "Download snapshot as CSV"
    }, {
        icon: "icons/import.svg",
        action: this.importCSVReport.bind(this),
        mouseover: () => this.console.textContent = "Import CSV snapshot"
    }], {}, fileSegment.body);

    var programmeSegment = Draw.menuBarSegment("Programme", menubar);
    Draw.iconBar([{
        icon: "icons/plus.svg",
        action: this.map.newProgramme.bind(this.map),
        mouseover: () => this.console.textContent = "New programme"
    }], {}, programmeSegment.body);

    var reportSegment = Draw.menuBarSegment("Comparison", menubar);
    Draw.iconBar([{
        icon: "icons/camera.svg",
        action: this.newReport.bind(this),
        mouseover: () => this.console.textContent = "New snapshot"
    }, {
        icon: "icons/delete.svg",
        action: this.deleteCurrReport.bind(this),
        mouseover: () => this.console.textContent = "Delete snapshot"
    }], {}, reportSegment.body);

    this.map.reportSelectors();
    reportSegment.body.appendChild(this.map.elemReportSelectors);

    var printSegment = Draw.menuBarSegment("Print", menubar);
    Draw.iconBar([{
        icon: "icons/print.svg",
        action: this.print.bind(this),
        mouseover: () => this.console.textContent = "Print"
    }], {}, printSegment.body);
    this.printSizeSelector({
        "class": "pageSizeSelector"
    }, printSegment.body);

    var aboutSegment = Draw.menuBarSegment("About", menubar);
    Draw.iconBar([{
        icon: "icons/info.svg",
        action: () => alert(Loader.aboutText),
        mouseover: () => this.console.textContent = "About"
    }, {
        icon: "icons/question.svg",
        action: () => window.open("https://andymac-2.github.io/milestoneMap/instructions"),
        mouseover: () => this.console.textContent = "Help"
    }], {}, aboutSegment.body);

    Draw.elem("div", {
        "class": "menuBarPlaceholder"
    }, this.elem);

    this.elem.appendChild(this.map.elemContainer);
    this.map.draw();
};


// correspond to Loader.PAGESIZENAMES
/** @const {number} */ Loader.PAGEMARGIN = 35;
/** @const {Array<Object<number>>}*/ Loader.PAGESIZES = [
    { height: 1682, width: 2378 },
    { height: 1189, width: 1682 },
    { height: 841, width: 1189 },
    { height: 594, width: 841 },
    { height: 420, width: 594 },
    { height: 297, width: 420 },
    { height: 210, width: 297 },
    { width: 1682, height: 2378 },
    { width: 1189, height: 1682 },
    { width: 841, height: 1189 },
    { width: 594, height: 841 },
    { width: 420, height: 594 },
    { width: 297, height: 420 },
    { width: 210, height: 297 },
].map(elem => {
    if (elem.width > elem.height) {
        return {
            height: elem.height - Loader.PAGEMARGIN * 2,
            width: elem.width - Loader.PAGEMARGIN * 2,
        };
    }
    else {
        return elem;
    }
});
/** @const {Object<number>}*/ Loader.A3SIZE = Loader.PAGESIZES[5];
// correspond to Loader.PAGESIZES
/** @const Array<string> */ Loader.PAGESIZENAMES = [
    "4A0 Landscape",
    "2A0 Landscape",
    "A0 Landscape",
    "A1 Landscape",
    "A2 Landscape",
    "A3 Landscape",
    "A4 Landscape",
    "4A0 Portrait",
    "2A0 Portrait",
    "A0 Portrait",
    "A1 Portrait",
    "A2 Portrait",
    "A3 Portrait",
    "A4 Portrait",
];
Loader.prototype.printSizeSelector = function (attrs, parent) {
    var onchange = (evt) => {
        this.map.pageSize = Loader.PAGESIZES[evt.currentTarget.value];
    }
    Draw.dropDownSegment(
        "Page Size:", onchange, Loader.PAGESIZENAMES, attrs, parent);
};

// modifications


// user events
Loader.prototype.newReport = function () {
    this.map.addReport({ "name": "New Report", "date": this.map.defaultDate() });
    this.draw();
};
Loader.prototype.deleteCurrReport = function () {
    if (this.map.reports.length <= 1) {
        return;
    }

    this.map.currReport.deleteThis();
    this.draw();
};

Loader.prototype.newFile = function () {
    this.saveLoad.reset();
    var now = MilestoneMap.prototype.defaultDate();
    var twoMonths = 60 * 24 * 60 * 60 * 1000;
    var twoMonthsAgo = now - twoMonths;
    var date = new Date(twoMonthsAgo);
    var nextYear = date.setUTCFullYear(date.getUTCFullYear() + 1).valueOf();

    this.map = new MilestoneMap({
        "name": "New Map",
        "start": twoMonthsAgo,
        "end": nextYear,
        "programmes": [],
        "projects": [],
        "milestones": [],
        "msAtReports": [],
        "reports": [
            { "name": "Baseline", "date": now },
        ],
        "dependencies": [],
        "currReport": 0,
        "cmpReport": 0
    });
    this.draw();
};

Loader.prototype.loadFile = function () {
    var restoreDraw = (obj) => {
        try {
            this.restore(obj);
            this.draw();
        }
        catch (e) {
            alert("Error: Invalid file.");
            throw e;
        }
    };
    this.saveLoad.open(restoreDraw);
};
Loader.prototype.uploadFile = function () {
    var restoreDraw = (string) => {
        try {
            this.restore(JSON.parse(string));
            this.draw();
        }
        catch (e) {
            alert("Error: Invalid file.");
            throw e;
        }
    };
    Util.upload(this.elem, restoreDraw, ".json");
};
Loader.prototype.importCSVReport = function () {
    var restoreDraw = (string) => {
        try {
            var arr = Util.parseCSV(string);
            this.map.addReportFromCSV(arr);
            this.draw();
        }
        catch (err) {
            Util.allertErr(err);
            throw err;
        }
    };

    Util.upload(this.elem, restoreDraw, ".csv");
};

Loader.prototype.exportCSV = function () {
    var string = this.map.exportCSVMilestones();
    Util.download(this.map.name + ".csv", string, "text/csv",
        this.elem);
};

Loader.prototype.print = function () {
    var mMap = new MilestoneMap(this.map.save(), this.map.pageSize);

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
        throw err;
    }
};


/** @const {string} */ Loader.aboutText = `Milestone Map, Version: ` + VERSION + `

For help and support, please visit:

https://andymac-2.github.io/milestoneMap/instructions

Copyright 2018 Andrew Pritchard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
`;
