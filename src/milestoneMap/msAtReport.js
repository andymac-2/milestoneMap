'use strict'

var MsAtReport = function (obj, index, mMap) {
    // state
    this.milestone;
    this.report;
    this.comment;
    this.status;
    this.date;

    //view
    this.elem = Draw.svgElem("g", {
        "class": "msAtReport"
    });
    // used to prevent click event accumulation
    this.g;

    // view model
    this.dependencies = [];
    this.dependents = [];
    this.index = index;
    this.mMap = mMap;

    this.restore (obj);
};
// static methods/properties
MsAtReport.COMPLETE = 0;
MsAtReport.ONTRACK = 1;
MsAtReport.ATRISK = 2;
MsAtReport.LATE = 3;
MsAtReport.PREVIOUS = 4;

MsAtReport.DIAMONDSIZE = 7;

Milestone.resolveStatusClass = function (status) {
    switch (status) {
    case MsAtReport.COMPLETE:
        return "complete";
    case MsAtReport.ONTRACK:
        return "on-track";
    case MsAtReport.ATRISK:
        return "at-risk";
    case MsAtReport.LATE:
        return "late";
    case MsAtReport.PREVIOUS:
        return "previous";
    }
};


MsAtReport.prototype.restore = function (obj) {
    if (this.milestone) {
        this.milestone.removeReport (this);
    }
    
    this.milestone = this.mMap.milestones[obj.milestone];
    this.milestone.addReport(this);
    
    this.report = this.mMap.reports[obj.report];
    this.comment = obj.comment;
    this.status = obj.status;
    this.date = obj.date;
};
MsAtReport.prototype.save = function () {
    assert (() => this.mMap.reports[this.report.index] === this.report);
    assert (() => this.mMap.milestones[this.milestone.index] ===
            this.milestone);
    return {
        milestone: this.milestone.index,
        report: this.report.index,
        comment: this.comment,
        status: this.status,
        date: this.date
    };
};

MsAtReport.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    if (this.report !== this.mMap.currReport &&
        this.report !== this.mMap.cmpReport)
    {
        return;
    }

    var x = this.mMap.getXCoord (this.date);
    this.elem.setAttribute("transform", "translate(" + x + " 0)");

    var cls = MsAtReport.PREVIOUS;

    this.g = Draw.svgElem("g", {}, this.elem);

    if (this.report === this.mMap.currReport) {
        this.milestone.currX = x;
        cls = this.status;
        
        this.drawCurrent();
    }   
    else if (this.report === this.mMap.cmpReport){
        this.milestone.cmpX = x;
    }

    var diamond = Draw.svgElem("path", {
        "class": Milestone.resolveStatusClass (cls),
        "d" : "M -" +  MsAtReport.DIAMONDSIZE + " 0" +
            "L 0 " +  MsAtReport.DIAMONDSIZE +
            "L " + MsAtReport.DIAMONDSIZE + " 0" +
            "L 0 -" + MsAtReport.DIAMONDSIZE + " Z"
    }, this.g);
    diamond.addEventListener ("click", this.diamondOnClick.bind(this));

};

MsAtReport.prototype.drawCurrent = function () {   
    var foreign = Draw.svgElem("foreignObject", {
        "width": "200",
        "height": "18",
        "x": "-100",
        "y": "-25"
    }, this.g);
    
    var body = Draw.htmlElem("div", {
    }, foreign)
    
    var name = Draw.htmlElem ("input", {
        "class": "wide",
        "width": "100%",
        "value": this.milestone.name,
        "type": "text"
    }, body);
    name.addEventListener(
        "change", this.milestone.modifyName.bind(this.milestone, name));

    foreign = Draw.svgElem("foreignObject", {
        "width": "200",
        "height": "40",
        "x": "-100",
        "y": "10"
    }, this.g);

    body = Draw.htmlElem("div", {
    }, foreign);

    var date = Draw.htmlElem ("input", {
        "type": "date",
        "required": "",
        "max": Util.getISODateOnly (this.mMap.end),
        "min": Util.getISODateOnly (this.mMap.start),
        "value": Util.getISODateOnly (this.date)
    }, body);
    date.addEventListener ("change", this.modifyDate.bind(this, date));
    
    var menu = Draw.menu (Draw.ALIGNCENTER, [{
        "icon": "icons/health.svg",
        "action": this.cycleStatus.bind(this)
    },{
        "icon": "icons/delete.svg",
        "action": this.deleteDraw.bind(this)
    },{
        "icon": "icons/arrow-right.svg",
        "action": this.createDependency.bind(this)
    }], this.g);
    menu.setAttribute ("transform", "translate(0, -50)");

    // TODO put other text here
};

// linking
MsAtReport.prototype.addDependency = function (dependency) {
    assert (() => dependency instanceof Dependency);
    this.dependencies.push(dependency);
};
MsAtReport.prototype.removeDependency = function (dependency) {
    this.dependencies = this.dependencies.filter(elem => elem !== dependency);
};
MsAtReport.prototype.addDependent = function (dependent) {
    assert (() => dependent instanceof Dependency);
    this.dependents.push(dependent);
};
MsAtReport.prototype.removeDependent = function (dependent) {
    this.dependents = this.dependents.filter(elem => elem !== dependent);
};

// events
MsAtReport.prototype.diamondOnClick = function () {
    if (this.mMap.globalMode === MilestoneMap.CREATEDEPENDENCY) {
        var dep = this.mMap.addDependency ({
            "report": this.mMap.currReport.index,
            "dependency": this.mMap.globalData,
            "dependent": this.milestone.index
        });
        dep.draw();
    };
};

// modifications
MsAtReport.prototype.deleteThis = function () {    
    this.milestone.removeReport (this);
    this.dependencies.forEach(dependency => dependency.deleteDraw());
    this.dependents.forEach(dependent => dependent.deleteDraw());
    this.mMap.removeMsAtReport (this);
};


// user modifications
MsAtReport.prototype.modifyDate = function (elem) {
    var date = new Date(elem.value + "T01:00:00.000Z").valueOf();

    this.date = this.mMap.clampDate (date);

    this.draw();
    this.milestone.draw();
    this.dependencies.forEach(dep => dep.draw());
    this.dependents.forEach(dep => dep.draw());
};
MsAtReport.prototype.cycleStatus = function () {
    this.status = this.status >= MsAtReport.LATE ? 0 : this.status + 1;
    this.draw ();
};
MsAtReport.prototype.deleteDraw = function () {
    this.deleteThis ();

    if (this.milestone.atReports.length === 0) {
        this.milestone.deleteDraw ();
    }
    else {
        this.milestone.draw();
    }
};
MsAtReport.prototype.createDependency = function () {
    this.mMap.globalMode = MilestoneMap.CREATEDEPENDENCY;
    this.mMap.globalData = this.milestone.index;
    this.mMap.globalModeSet = true;
};
