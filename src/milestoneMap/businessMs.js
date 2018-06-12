'use strict'

/** @constructor
    @struct */
var BusinessMs = function (mMap) {
    // state
    /** @type {Array<Milestone>} */ this.milestones = [];

    /** @const {number} */ this.index = -1;
    this.name = "Business Milestones"
    
    // view
    /** @type {Element} */
    this.elem = Draw.svgElem("g", {
        "class": "businessMs",
    });
    /** @type {Element} */
    this.elemLines = Draw.svgElem("g", {
        "class": "businessMs",
    });

    // view model
    /** @type {MilestoneMap} */ this.mMap = mMap;
    /** @type {number} */ this.height = Project.MINHEIGHT;
};

// TODO: variable height milestone data.
BusinessMs.prototype.draw = function () {
    this.elem.innerHTML = "";
    this.elemLines.innerHTML = "";

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
            var msAtReport = milestone.currentReport();
            assert (() => msAtReport);
            
            msAtReport.drawLine();
            milestones.appendChild (milestone.elem);
            this.elemLines.appendChild (msAtReport.elemLineMain);
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
BusinessMs.prototype.newMilestone = Project.prototype.newMilestone;
