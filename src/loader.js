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

    Draw.menuBarSegment("File", [{
        "icon": "icons/new.svg",
        "action": this.newFile.bind(this)
    }, {
        "icon": "icons/open.svg",
        "action": this.loadFile.bind(this)
    }, {
        "icon": "icons/save.svg",
        "action": this.save.bind(this)
    }, {
        "icon": "icons/print.svg",
        "action": () => {} // TODO
    }], menubar);

   Draw.menuBarSegment("Programme", [{
        "icon": "icons/plus.svg",
        "action": this.map.newProgramme.bind(this.map)
    }], menubar)

    var reportMenu = Draw.menuBarSegment("Report", [{
        "icon": "icons/plus.svg",
        "action": this.newReport.bind(this)
    }, {
        "icon": "icons/delete.svg",
        "action": this.deleteCurrReport.bind(this)
    }], menubar);

    var container = Draw.elem ("span", {
        "class": "reportSelectorContainer"
    }, reportMenu)
    
    
    this.reportSelector (
        "Current:", this.modifyCurrReport.bind(this), {
            "class": "reportSelector"
        }, container);
    this.reportSelector (
        "Baseline:", this.modifyCmpReport.bind(this), {
            "class": "reportSelector"
        }, container);

    var version = Draw.elem ("span", {
        "class": "menuBarSegment"
    }, menubar);

    var header = Draw.elem ("div", {
        "class": "menuBarHeader"
    }, version).textContent = "Version: " + VERSION;

    Draw.svgElem ("svg", {
        "width": "200"
    }, version);
  
    this.elem.appendChild(this.map.scrollbox);
    var height = window.innerHeight - Draw.getElemHeight(menubar) - 10;
    this.map.scrollbox.setAttribute("style", "max-height:" + height + "px;");
    
    this.map.draw();
};
Loader.prototype.reportSelector = function (text, onchange, attrs, parent) {
    var div = Draw.elem("span", attrs, parent);

    div.textContent = text;
    
    var select = Draw.elem ("select", {
        "class": "reportSelectorDropdown"
    }, div);
    select.addEventListener ("change", onchange);

    Draw.elem ("option", {
        "selected": "",
        "disabled": "",
        "hidden": ""
    }, select).textContent = "Select a report";
    
    this.map.reports.forEach (report => report.drawMenu(select));

    return div;
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
    this.map.addReport ({"name": "New Report", "date": Date.now()});
    this.draw();
};
Loader.prototype.deleteCurrReport = function () {
    this.map.currReport.deleteThis();
    this.draw();
};

Loader.prototype.newFile = function () {
    var now = Date.now();
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
    }
    
    Util.upload (this.elem, restoreDraw);
};
