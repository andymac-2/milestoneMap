'use strict'


var Loader = function (parent) {
    //view
    this.elem = Draw.htmlElem ("div", {
        "class": "milestoneMapContainer"
    }, parent);

    this.map;
    this.file;

    this.newFile();
    this.draw();
};

Loader.prototype.save = function () {
    
};

Loader.prototype.restore = function () {
    
};
Loader.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    var menubar = Draw.htmlElem ("div", {
        "class": "menubar"
    }, this.elem);

    var fileMenu = Draw.menuBarSegment("File", [{
        "icon": "icons/new.svg",
        "action": () => {}
    }, {
        "icon": "icons/open.svg",
        "action": () => {}
    }, {
        "icon": "icons/save.svg",
        "action": () => {}
    }, {
        "icon": "icons/print.svg",
        "action": () => {}
    }], menubar);

    var programmeMenu = Draw.menuBarSegment("Programme", [{
        "icon": "icons/plus.svg",
        "action": this.map.newProgramme.bind(this.map)
    }], menubar)
    programmeMenu.setAttribute("width", "90");

    var reportMenu = Draw.menuBarSegment("Report", [{
        "icon": "icons/plus.svg",
        "action": this.newReport.bind(this)
    }, {
        "icon": "icons/delete.svg",
        "action": () => {}
    }], menubar);
    reportMenu.setAttribute("width", "350");
    
    
    this.reportSelector (
        "Current:", this.modifyCurrReport.bind(this), {
            "transform": "translate(90, 35)"
        }, reportMenu);
    this.reportSelector (
        "Comparison:", this.modifyCmpReport.bind(this), {
            "transform": "translate(90, 55)"
        }, reportMenu);

    Draw.htmlElem ("span", {}, menubar).textContent = "Start Date:";
    Draw.htmlElem ("input", {
        "type": "date"
    }, menubar);
    Draw.htmlElem ("span", {}, menubar).textContent = "End Date:";
    Draw.htmlElem ("input", {
        "type": "date"
    }, menubar);

    this.elem.appendChild(this.map.elem);
    this.map.draw();
};
Loader.prototype.reportSelector = function (text, onchange, attrs, parent) {
    var g = Draw.svgElem("g", attrs, parent);

    var foreign = Draw.svgElem("foreignObject", {
        "width": "240",
        "height": "20",
        "x": "0",
        "y": "-20",
        "class": "reportSelector"
    }, g);
    
    Draw.elem ("span", {
        "class": "reportSelectorHeader"
    }, foreign).textContent = text;
    var select = Draw.elem ("select", {
        "class": "reportSelectorDropdown"
    }, foreign);
    select.addEventListener ("change", onchange);
    
    this.map.reports.forEach (report => report.drawMenu(select));

    return g;
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


Loader.prototype.newFile = function () {
    // TODO: make the start date and end date correct.
    // this.map = new MilestoneMap ({
    //     start: 1523788263794,
    //     end: 1550226663794,
    //     programmes: [],
    //     projects: [],
    //     milestones: [],
    //     msAtReports: [],
    //     reports: [
    //         {date: 1543788263794},
    //     ],
    //     dependencies: [],
    //     currReport: 0,
    //     cmpreport: 0
    // }, this.elem;);


    this.map = new MilestoneMap ({
        start: 1523788263794,
        end: 1550226663794,
        programmes: [],
        projects: [],
        milestones: [],
        msAtReports: [ ],
        reports: [
            {name: "Report 1", date: 1543788263794},
            {name: "Report 2", date: 1533788263794}
        ],
        dependencies: [],
        currReport: 0,
        cmpReport: 1
    });
};
