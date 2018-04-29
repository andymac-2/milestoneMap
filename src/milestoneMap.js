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

    this.businessMs;
    
    //view
    this.scrollbox = Draw.elem ("div", {
        "class": "mMapScrollBox"
    });
    
    this.elem = Draw.svgElem("svg", {
        "class": "milestoneMap",
        "height": 5000
    }, this.scrollbox);
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
    this.width;
    this.unclicker = new Unclicker (this.elem);
    this.dateHeader;

    // events
    this.globalMode = MilestoneMap.SELECT;
    this.globalData = null;
    this.globalModeSet = false;

    this.restore (obj);
};
MilestoneMap.SELECT = 0;
MilestoneMap.CREATEDEPENDENCY = 1;

// restore here will also draw as well
MilestoneMap.prototype.restore = function (obj) {
    this.start = obj.start;
    this.end = obj.end;
    this.name = obj.name;

    this.businessMs = new BusinessMs (this);

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
    return {
        "name": this.name,
        "end": this.end,
        "start": this.start,
        "currReport": this.currReport.index,
        "cmpReport": this.cmpReport.index,
        "reports": this.reports.map(o => o.save()),
        "programmes": this.programmes.map(o => o.save()),
        "projects": this.projects.map(o => o.save()),
        "milestones": this.milestones.map(o => o.save()),
        "msAtReports": this.msAtReports.map(o => o.save()),
        "dependencies": this.dependencies.map(o => o.save())
    }
};

// drawing methods
MilestoneMap.prototype.draw = function (obj) {
    this.fg.innerHTML = "";
    this.bg.innerHTML = "";
    this.depLayer.innerHTML = "";

    this.width = this.elem.getBoundingClientRect().width

    // maybe this would be better as a series of functions rather than a class.
    this.dateHeader = new DateHeader (this);
    
    this.msAtReports.forEach (elem => elem.draw());
    this.milestones.forEach (elem => elem.draw());
    this.projects.forEach (elem => elem.draw());
    this.programmes.forEach (elem => this.fg.appendChild(elem.draw()));

    this.fg.appendChild(this.businessMs.draw());
    this.fg.appendChild(this.currReport.drawLine());
    
    this.reflow ();
};
MilestoneMap.prototype.drawDependencies = function () {
    this.dependencies.forEach (elem => {
        elem.draw();
        this.depLayer.appendChild (elem.elem);
    });
};

MilestoneMap.prototype.reflow = function () {
    var height = Draw.verticalReflow (this.dateHeader.endy, [this.businessMs]);
    height = Draw.verticalReflow (height, this.programmes);
    height = height < window.innerHeight ? window.innerHeight: height;
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
    var now = new Date(Date.now());
    var offset = now.getTimezoneOffset() * 60 * 1000;
    return now.valueOf() + offset;
};

MilestoneMap.prototype.isInInterval = function (value) {
    return (value >= this.start && value <= this.end);
};

MilestoneMap.prototype.clampDate = function (date) {
    return Util.clamp (this.start, this.end, date);
};

// Modifications
MilestoneMap.prototype.modifyCurrReport = function (index) {
    if (index >= 0 && index < this.reports.length) {
        return this.currReport = this.reports[index];
    }
};
MilestoneMap.prototype.modifyCmpReport = function (index) {
    if (index >= 0 && index < this.reports.length) {
        return this.cmpReport = this.reports[index];
    }
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

MilestoneMap.prototype.addProgramme = function (obj) {
    var programme = new Programme (obj, this.programmes.length, this);
    this.programmes.push (programme);
    return programme;
};
MilestoneMap.prototype.removeProgramme = function (programme) {
    Util.removeFromIndexedArray (this.programmes, programme);
};

MilestoneMap.prototype.addReport = function (obj) {
    var report = new Report (obj, this.reports.length, this);
    this.reports.push (report);

    var msAtReports = this.msAtReports.filter(ms => {
        return ms.report === this.currReport;
    });

    msAtReports.forEach (ms => {
        var obj = ms.save();
        obj.report = report.index;
        this.addMsAtReport (obj);
    });

    var dependencies = this.dependencies.filter(dep => {
        return dep.report === this.currReport;
    });

    dependencies.forEach (dep => {
        var obj = dep.save();
        obj.report = report.index;
        this.addDependency(obj);
    });

    this.cmpReport = this.currReport;
    this.currReport = report;
};
MilestoneMap.prototype.removeReport = function (report) {
    Util.removeFromIndexedArray (this.reports, report);
};


// user events
MilestoneMap.prototype.newProgramme = function () {
    this.addProgramme({
        "name": "New Programme"
    });

    this.draw();
};

// called by svgTextInput
MilestoneMap.prototype.modifyName = function (e, input) {
    this.name = input.text;
};

// called by svgDateInput change of date will require complete redraw.
MilestoneMap.prototype.modifyStartDate = function (e, input) {
    this.start = input.date;
    this.draw();
};

// called by svgDateInput change of date will require complete redraw.
MilestoneMap.prototype.modifyEndDate = function (e, input) {
    this.end = input.date;
    this.draw();
};
