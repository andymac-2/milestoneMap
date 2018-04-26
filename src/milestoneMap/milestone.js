
'use strict'

var Milestone = function (obj, index, mMap) {
    // state
    this.name;
    this.project;

    // view
    this.elem = Draw.svgElem("g", {
        "class": "milestone"
    });

    // view model
    this.mMap = mMap;
    this.index = index;
    this.cmpX;
    this.currX;
    this.atReports = [];   

    this.restore (obj);
};

Milestone.prototype.restore = function (obj) {
    this.name = obj.name;
    
    if (this.project) {
        this.project.removeMilestone (this);
    }
    
    this.project = this.mMap.projects[obj.project];
    this.project.addMilestone (this);
};
Milestone.prototype.save = function () {
    return {
        name: this.name,
        project: this.project.index
    };
};
Milestone.prototype.draw = function () {
    this.elem.innerHTML = "";

    if (this.currentReport() && this.cmpReport() &&
        (this.mMap.currReport !== this.mMap.cmpReport)) {
        Draw.svgElem ("line", {
            "class": "compareLine",
            "x1": this.cmpX, "y1": "0",
            "x2": this.currX, "y2": "0"
        }, this.elem);
        
        if (this.cmpX < this.currX) {
            Draw.svgElem ("path", {
                "class": "compareArrow",
                "d": "M -6 -6 L -6 6 L 0 0 Z",
                "transform": "translate("+
                    (this.currX - MsAtReport.DIAMONDSIZE) + ", 0)"
            }, this.elem);
        }
        else if (this.cmpX > this.currX) {
            Draw.svgElem ("path", {
                "class": "compareArrow",
                "d": "M 6 -6 L 6 6 L 0 0 Z",
                "transform": "translate("+
                    (this.currX + MsAtReport.DIAMONDSIZE) + ", 0)"
            }, this.elem);
        }
    };

    this.atReports.forEach(atReport => this.elem.appendChild (atReport.elem));
};


// linking
Milestone.prototype.addReport = function (report) {
    assert (() => report instanceof MsAtReport);
    this.atReports.push(report);
};
Milestone.prototype.removeReport = function (msAtReport) {
    this.atReports = this.atReports.filter(elem => elem !== msAtReport);
};

// modifications
Milestone.prototype.deleteThis = function () {
    this.project.removeMilestone (this);
    this.atReports.forEach(atReport => atReport.deleteThis());
    this.mMap.removeMilestone (this);
};

// user modifications
Milestone.prototype.modifyName = function (elem) {
    this.name = elem.value;
};
Milestone.prototype.deleteDraw = function () {
    this.deleteThis ();
    this.project.draw ();
};



// other methods
Milestone.prototype.hasReport = function (report) {
    return this.atReports.find(msAtReport => msAtReport.report === report);
};
Milestone.prototype.currentReport = function () {
    return this.hasReport (this.mMap.currReport);
};
Milestone.prototype.cmpReport = function () {
    return this.hasReport (this.mMap.cmpReport);
};
