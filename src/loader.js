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
    }], svg);
    menu.setAttribute ("transform", "translate (0, 15)")

    Draw.htmlElem ("span", {}, menubar).textContent = "Current Report:";
    Draw.htmlElem ("span", {}, menubar).textContent = "Comparison Report:";
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
            {date: 1543788263794},
            {date: 1533788263794}
        ],
        dependencies: [],
        currReport: 0,
        cmpReport: 1
    });
};
