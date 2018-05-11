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
    this.elemLine = Draw.svgElem ("g", {
        "class": "businessMsLine"
    });
    this.elemLineMain = Draw.svgElem ("g", {
        "class": "businessMsLine"
    });
    this.elemInfo = Draw.svgElem ("g", {
        "class": "milestoneInfo"
    });
    this.elemPointer = Draw.svgElem("g", {
        "class": "milestonePointer"
    });
    this.x;
    
    // used to prevent click event accumulation
    this.g;
    this.diamond;

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



// drawing methods
MsAtReport.prototype.draw = function () {
    this.elem.innerHTML = "";
    this.elemPointer.innerHTML = "";

    this.x = this.mMap.getXCoord (this.date);
    this.elem.setAttribute("transform", "translate(" + this.x + " 0)");
    
    if (!this.isDrawable())
    {
        return;
    }

    this.drawInfo();
    this.elem.appendChild(this.elemPointer);
    if (this.isCurrent() && this.isBusinessMs() && this.isDrawable()) {
        this.elem.appendChild(this.elemLine);
    }
    
    
    var g = Draw.svgElem("g", {}, this.elem);

    this.diamond = Draw.svgElem("path", {
        "class": this.resolveStatusClass (),
        "d" : "M -" +  MsAtReport.DIAMONDSIZE + " 0" +
            "L 0 " +  MsAtReport.DIAMONDSIZE +
            "L " + MsAtReport.DIAMONDSIZE + " 0" +
            "L 0 -" + MsAtReport.DIAMONDSIZE + " Z"
    }, g);
    this.diamond.addEventListener ("click", this.diamondOnClick.bind(this));
};
MsAtReport.prototype.drawLine = function () {
    this.elemLine.innerHTML = "";

    Draw.svgElem("line", {
        "x1": 0, "y1": 0,
        "x2": 0, "y2": "100%"
    }, this.elemLine);

    Draw.svgElem("line", {
        "x1": this.x, "y1": 0,
        "x2": this.x, "y2": "100%"
    }, this.elemLineMain);

    return this.elemLine;
};

MsAtReport.prototype.drawInfo = function () {
    this.elemInfo.innerHTML = "";

    if (!this.isCurrent()) {
        return this.elemInfo;
    }
    var g = Draw.svgElem ("g", {
        "transform": "translate(" + this.x + " 0)"
    }, this.elemInfo);
    
    var nameDate = new MilestoneTD ({
        unclicker: this.mMap.unclicker,
        onChange: this.modifyData.bind(this),
        parent: g,
        attrs: {
            "class": "milestoneData"
        }
    }, this.milestone.name, this.date, this.comment);
    
    Draw.menu (Draw.ALIGNLEFT, this.mMap.unclicker, [{
        "icon": "icons/health.svg",
        "action": this.cycleStatus.bind(this)
    },{
        "icon": "icons/delete.svg",
        "action": this.deleteDraw.bind(this)
    },{
        "icon": "icons/arrow-right.svg",
        "action": this.createDependency.bind(this)
    }], {
        "transform": "translate(0, -75)"
    }, g);

    return this.elemInfo;
};

MsAtReport.prototype.drawPointer = function (level) {
    this.elemPointer.innerHTML = "";
    var height = Project.MILESTONEOFFSET -
        level * (MilestoneTD.HEIGHT / 2) -
        Project.MINHEIGHT - 20;;
    var line = Draw.svgElem ("line", {
        "x1": "0", "y1":  height,
        "x2": "0", "y2": 0
    }, this.elemPointer);
    var circle = Draw.svgElem ("circle", {
        "cx": "0", "cy": height,
        "r": "2"
    }, this.elemPointer);
};



MsAtReport.prototype.resolveStatusClass = function () {
    if (this.isCurrent()) {
        switch (this.status) {
        case MsAtReport.COMPLETE:
            return "complete";
        case MsAtReport.ONTRACK:
            return "on-track";
        case MsAtReport.ATRISK:
            return "at-risk";
        case MsAtReport.LATE:
            return "late";
        }
    }
    else if (this.mMap.cmpReport === this.report){
        return "previous";
    }
    assert (() => false);
};
MsAtReport.classToStatus = function (classString) {
    switch (classString) {
    case "complete":
        return MsAtReport.COMPLETE;
    case "on-track":
        return MsAtReport.ONTRACK;
    case "at-risk":
        return MsAtReport.ATRISK;
    case "late":
        return MsAtReport.LATE;
    case "previous":
        return MsAtReport.PREVIOUS;
    }
    assert (() => false);
};
MsAtReport.prototype.isDrawable = function () {
    return (this.isCurrent() || this.isComparison())
        && this.mMap.isInInterval(this.date);
};
MsAtReport.prototype.isCurrent = function () {
    return this.mMap.currReport === this.report;
};
MsAtReport.prototype.isComparison = function () {
    return this.report === this.mMap.cmpReport
};
MsAtReport.prototype.isBusinessMs = function () {
    return this.milestone.project.index === -1;
};

MsAtReport.prototype.updateDiamond = function (cls) {
    this.diamond.setAttribute("class", this.resolveStatusClass());
};

MsAtReport.COMMENTFONT = "small italic sans-serif";
MsAtReport.NAMEFONT = "small sans-serif";
MsAtReport.INFOMARGIN = 15;
MsAtReport.prototype.getLine1Width = function () {
    var width = Draw.getTextWidth(
        MsAtReport.NAMEFONT, this.milestone.name + "MMM 00: ");
    return width + MsAtReport.INFOMARGIN;
};
MsAtReport.prototype.getLine2Width = function () {
    var width = Draw.getTextWidth(MsAtReport.COMMENTFONT, this.comment);
    return width === 0 ? 0 : width + MsAtReport.INFOMARGIN;
};

MsAtReport.prototype.reflowUp = function () {
    var project = this.milestone.project;
    project.draw();
    project.reflowUp();
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
MsAtReport.prototype.modifyData = function (input) {
    this.date = this.mMap.clampDate (input.date);
    this.comment = input.comment;
    this.milestone.name = input.title;

    this.draw();
    this.drawLine();
    this.milestone.draw();

    this.reflowUp();
};
MsAtReport.prototype.cycleStatus = function () {
    this.status = this.status >= MsAtReport.LATE ? 0 : this.status + 1;
    this.updateDiamond();
};
MsAtReport.prototype.deleteDraw = function () {
    this.deleteThis ();

    if (this.milestone.atReports.length === 0) {
        this.milestone.deleteThis ();
    }
    else {
        this.milestone.draw();
    }

    this.reflowUp ();
};
MsAtReport.prototype.createDependency = function () {
    this.mMap.globalMode = MilestoneMap.CREATEDEPENDENCY;
    this.mMap.globalData = this.milestone.index;
    this.mMap.globalModeSet = true;
};
