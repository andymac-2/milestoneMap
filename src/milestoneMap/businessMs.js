'use strict'

var BusinessMs = function (mMap) {
    // state
    this.milestones = [];

    this.index = -1;
    this.name = "Business Milestones"
    
    // view
    this.elem = Draw.svgElem("g", {
        "class": "businessMs",
    });

    // view model
    this.mMap = mMap;
    this.height = BusinessMs.HEIGHT;
};

// TODO: variable height milestone data.
BusinessMs.prototype.draw = function () {
    this.elem.innerHTML = "";

    this.flowMilestoneData();
    
    Draw.svgElem("line", {
        "x1": 0,
        "y1": (this.height - Project.MILESTONEOFFSET),
        "x2": this.mMap.width,
        "y2": (this.height - Project.MILESTONEOFFSET),
        "class": "projectLine"
    }, this.elem);

    var milestones = Draw.svgElem("g", {
        "transform": "translate(0, " + (this.height - Project.MILESTONEOFFSET) + ")"
    }, this.elem);
    this.milestones
        .filter (milestone => milestone.currentReport())
        .forEach(milestone => {
            assert (() => milestone.currentReport());
            milestone.currentReport().drawLine();
            milestones.appendChild (milestone.elem);
        });

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "class": "businessMsHeader",
        "transform": "translate(0, " + (this.height - 30) + ")"
    } , this.elem);
    
    var name = Draw.svgElem ("text", {}, g).textContent = "Business Milestones";
    
    var menu = Draw.menu (Draw.ALIGNLEFT, this.mMap.unclicker, [{
        "icon": "icons/plus.svg",
        "action": this.newMilestone.bind(this)
    }], {
        "transform": "translate(180, -7)"
    }, g);

    return this.elem;
};
BusinessMs.prototype.flowMilestoneData = Project.prototype.flowMilestoneData;

// call this if you expect the hieght to change.
BusinessMs.prototype.reflowUp = function () {
    this.mMap.reflow();
};

//linking
BusinessMs.prototype.addMilestone = function (milestone) {
    this.milestones.push (milestone);
};

BusinessMs.prototype.removeMilestone = function (milestone) {
    this.milestones = this.milestones.filter(elem => elem !== milestone);
};

// user modifications
BusinessMs.prototype.newMilestone = function () {
    var milestone = this.mMap.addMilestone({
        "name": "New Milestone",
        "project": this.index
    });

    var msAtReport = this.mMap.addMsAtReport({
        "milestone": milestone.index,
        "report": this.mMap.currReport.index,
        "comment": "",
        "status": MsAtReport.ONTRACK,
        "date": this.mMap.defaultDate()
    });

    msAtReport.draw();
    milestone.draw();
    this.draw();
};
