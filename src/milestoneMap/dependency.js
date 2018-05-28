'use strict'

var Dependency = function (obj, index, mMap) {
    //state
    this.dependency;
    this.dependent;
    this.report;

    // view
    this.elem = Draw.svgElem("g", {
        "class": "dependency"
    });
    this.elem.addEventListener("dblclick", this.deleteDraw.bind(this));

    // model
    this.selected = false;
    this.index = index;
    this.mMap = mMap;

    this.restore (obj);
};
Dependency.HSPACE = 30;
Dependency.VSPACE = 30;

Dependency.prototype.restore = function (obj) {
    this.report = this.mMap.reports[obj.report];
    
    if (this.dependent) {
        this.dependent.removeDependency (this);
    }
    
    this.dependent = this.mMap.milestones[obj.dependent].hasReport(this.report);
    assert (() => this.dependent);
    this.dependent.addDependency (this);

    if (this.dependency) {
        this.dependency.removeDependent (this);
    }
    
    this.dependency = this.mMap.milestones[obj.dependency].hasReport(this.report);
    assert (() => this.dependency);
    this.dependency.addDependent (this);
};


Dependency.prototype.save = function () {
    assert (() => this.mMap.msAtReports[this.dependency.milestone.index] ===
            this.dependency);
    assert (() => this.mMap.msAtReports[this.dependent.milestone.index] ===
            this.dependent);

    return {
        dependent: this.dependent.milestone.index,
        dependency: this.dependency.milestone.index,
        report: this.report.index
    };
};

Dependency.prototype.draw = function () {
    this.elem.innerHTML = "";

    // TODO: somehow draw and signify milestones that are off the sides of the page.
    if (this.report !== this.mMap.currReport ||
        !this.dependent.isDrawable() || !this.dependency.isDrawable())
    {
        return;
    }

    var start = Draw.getElemXY(this.dependency.elem);
    //start.x +=  MsAtReport.DIAMONDSIZE;
    var end = Draw.getElemXY(this.dependent.elem);
    end.x -=  MsAtReport.DIAMONDSIZE;

    // Draw.quadrupleAngledLine (
    //     start, end, Dependency.HSPACE, Dependency.VSPACE, "dependencyLine",
    //     this.elem);

    // Draw.quadrupleAngledLine (
    //     start, end, Dependency.HSPACE, Dependency.VSPACE, "thick transparentLine",
    //     this.elem);

    Draw.sLine (start, end, 150, "dependencyLine", this.elem);
    Draw.sLine (start, end, 150, "vthick transparentLine", this.elem);

    Draw.svgElem ("path", {
        "class": "dependencyArrow",
        "d": "M -4 -4 L -4 4 L 0 0 Z",
        "transform": "translate("+ end.x + ", " + end.y + ")"
    }, this.elem);    
}

// modifications
Dependency.prototype.deleteThis = function () {
    this.dependency.removeDependent (this);
    this.dependent.removeDependency (this);

    this.mMap.removeDependency (this);
};


// user events
Dependency.prototype.deleteDraw = function () {
    this.deleteThis ();
    
    this.elem.parentNode.removeChild(this.elem);
};
