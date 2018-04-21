'use strict'

var MilestoneMap = function (obj) {
    
    //state
    this.start;
    this.end;
    this.programmes;
    this.projects;
    this.milestones;
    this.msAtReports;
    this.reports;
    this.dependencies;
    
    this.currReport;
    this.cmpReport;
    
    //view
    this.elem = Draw.svgElem("svg", {
        "class": "milestoneMap",
    });
    this.elem.addEventListener("click", this.deactivateOnUnclick.bind(this));
    
    this.bg = Draw.svgElem("g", {
        "class": "bg"
    }, this.elem);
    
    this.depLayer = Draw.svgElem("g", {
        "class": "dependencies"
    }, this.elem);
    
    this.fg = Draw.svgElem("g", {
        "class": "fg"
    }, this.elem);

    //view model
    this.parent = parent;
    this.width;

    // events
    this.globalMode = MilestoneMap.SELECT;
    this.globalData = null;
    this.globalModeSet = false;

    this.restore (obj);
};
MilestoneMap.SELECT = 0;
MilestoneMap.CREATEDEPENDENCY = 1;

MilestoneMap.STARTY = 40;
// restore here will also draw as well
MilestoneMap.prototype.restore = function (obj) {
    this.start = obj.start;
    this.end = obj.end;

    this.programmes = obj.programmes.map((programme, i) => {
        return new Programme (programme, i, this);
    });  
    this.projects = obj.projects.map((project, i) => {
        return new Project (project, i, this);
    });  
    this.milestones = obj.milestones.map((milestone, i) => {
        return new Milestone (milestone, i, this);
    });
    this.reports = obj.reports.map ((report, i) => {
        return new Report (report, i, this);
    });
    this.currReport = this.reports[obj.currReport];
    this.cmpReport = this.reports[obj.cmpReport];
    
    this.msAtReports = obj.msAtReports.map((ms, i) => {
        return new MsAtReport (ms, i, this);
    });
    this.dependencies = obj.dependencies.map((dep, i) => {
        return new Dependency (dep, i, this);
    });
};
MilestoneMap.prototype.save = function () {
    //TODO
};

// drawing methods
MilestoneMap.prototype.draw = function (obj) {
    this.fg.innerHTML = "";
    this.bg.innerHTML = "";
    this.depLayer.innerHTML = "";

    this.width = this.elem.getBoundingClientRect().width

    // maybe this would be better as a series of functions rather than a class.
    new DateHeader (this);
    
    this.msAtReports.forEach (elem => elem.draw());
    this.milestones.forEach (elem => elem.draw());
    this.projects.forEach (elem => elem.draw());
    this.programmes.forEach (elem => {
        elem.draw();
        this.fg.appendChild (elem.elem);
    });
    
    this.reflow ();
};
MilestoneMap.prototype.drawDependencies = function () {
    this.dependencies.forEach (elem => {
        elem.draw();
        this.depLayer.appendChild (elem.elem);
    });
};

MilestoneMap.prototype.reflow = function () {
    Draw.verticalReflow (MilestoneMap.STARTY, this.programmes);
    this.drawDependencies();
};
MilestoneMap.prototype.deactivateOnUnclick = function (event) {
    var active = [].slice.call(this.elem.getElementsByClassName("active"));
    for (var i = 0; i < active.length; i++) {
        if (!active[i].parentNode.contains(event.target)) {
            Draw.deactivate(active[i]);
        }
    }
    
    if (this.globalModeSet) {
        this.globalModeSet = false;
    }
    else {
        this.globalMode = MilestoneMap.SELECT;
        this.globalData = null;
    }
};


// x coordinate methods
MilestoneMap.prototype.getXCoord = function (date) {
    var z = (date.valueOf() - this.start)/(this.end - this.start)
    return z * this.width;
};
MilestoneMap.prototype.defaultDate = function () {
    return (this.start + this.end) / 2
};

MilestoneMap.prototype.isInInterval = function (value) {
    return (value >= this.start && value <= this.end);
};

MilestoneMap.prototype.clampDate = function (date) {
    return Util.clamp (this.start, this.end, date);
};

// add and removal methods
MilestoneMap.prototype.addMsAtReport = function (obj) {
    var msAtReport = new MsAtReport (obj, this.msAtReports.length, this);
    this.msAtReports.push(msAtReport);
    return msAtReport;
};
MilestoneMap.prototype.removeMsAtReport = function (msAtReport) {
    Util.removeFromIndexedArray (this.msAtReports, msAtReport);
};

MilestoneMap.prototype.addDependency = function (obj) {
    var dep = new Dependency (obj, this.dependencies.length, this);
    this.dependencies.push(dep);
    this.depLayer.appendChild (dep.elem);
    return dep;
};
MilestoneMap.prototype.removeDependency = function (dependency) {
    Util.removeFromIndexedArray (this.dependencies, dependency);
};

MilestoneMap.prototype.addMilestone = function (obj) {
    var milestone = new Milestone (obj, this.milestones.length, this);
    this.milestones.push(milestone);
    return milestone;
};
MilestoneMap.prototype.removeMilestone = function (milestone) {
    Util.removeFromIndexedArray (this.milestones, milestone)
};

MilestoneMap.prototype.addProject = function (obj) {
    var project = new Project (obj, this.projects.length, this);
    this.projects.push (project);
    return project;
};
MilestoneMap.prototype.removeProject = function (project) {
    Util.removeFromIndexedArray (this.projects, project);
};
