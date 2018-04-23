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

    var svg = Draw.svgElem ("svg", {
        "style": "display:inline;"
    }, menubar);

    var menu = Draw.visibleMenu (Draw.ALIGNLEFT, [{
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
    }, {
        "icon": "icons/plus.svg",
        "action": this.map.newProgramme.bind(this.map)
    }, {
        "icon": "icons/plus.svg",
        "action": this.newReport.bind(this)
    }], svg);
    menu.setAttribute ("transform", "translate (0, 15)")

    this.reportSelector (
        "Current:", this.modifyCurrReport.bind(this), menubar);
    this.reportSelector (
        "Comparison:", this.modifyCmpReport.bind(this), menubar);

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
Loader.prototype.reportSelector = function (text, onchange, parent) {
    var current = Draw.elem ("span", {}, parent);
    
    Draw.elem ("span", {}, current).textContent = text;
    var select = Draw.elem ("select", {}, current);
    select.addEventListener ("change", onchange);
    
    this.map.reports.forEach (report => report.drawMenu(select));

    return current;
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
