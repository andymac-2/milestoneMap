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

    var svg = Draw.svgElem ("svg", {}, menubar);

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
    }], svg);
    menu.setAttribute ("transform", "translate (0, 15)")

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
        programmes: [
            {name: "programme0"},
            {name: "programme1"},
            {name: "programme2"}
        ],
        projects: [
            {name: "project0", programme: 0},
            {name: "project1", programme: 0},
            {name: "project2", programme: 0},
            {name: "project0", programme: 1},
            {name: "project1", programme: 1},
            {name: "project2", programme: 1},
            {name: "project0", programme: 2},
            {name: "project1", programme: 2},
            {name: "project2", programme: 2}
        ],
        milestones: [
            {name: "milestone0", project: 2},
            {name: "milestone1", project: 3},
            {name: "milestone2", project: 4},
            {name: "milestone3", project: 2}
        ],
        msAtReports: [
            {
                milestone: 0,
                report: 0,
                comment: "the quick brown fox",
                status: MsAtReport.ONTRACK,
                date: 1533788263794
            },
            {
                milestone: 0,
                report: 1,
                comment: "the quick brown fox",
                status: MsAtReport.ONTRACK,
                date: 1528788263794
            },
            {
                milestone: 1,
                report: 0,
                comment: "the quick brown fox",
                status: MsAtReport.LATE,
                date: 1528788263794
            },
            {
                milestone: 2,
                report: 0,
                comment: "the quick brown fox",
                status: MsAtReport.ATRISK,
                date: 1533788263794
            },
            {
                milestone: 3,
                report: 0,
                comment: "the quick brown fox",
                status: MsAtReport.COMPLETE,
                date: 1543788263794
            }
        ],
        reports: [
            {date: 1543788263794},
            {date: 1533788263794}
        ],
        dependencies: [
            {report: 0, dependency: 0, dependent: 2}
        ],
        currReport: 0,
        cmpReport: 1
    });
};
