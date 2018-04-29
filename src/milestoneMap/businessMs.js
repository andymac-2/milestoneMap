'use strict'

var BusinessMs = function (mMap) {
    // state
    this.milestones = [];

    this.index = -1;
    this.name = "Business Milestones"
    
    // view
    this.elem = Draw.svgElem("g", {
        "class": "businessMs"
    });

    // view model
    this.mMap = mMap;
    this.height = BusinessMs.HEIGHT;
};


BusinessMs.HEIGHT = 30;
BusinessMs.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    Draw.svgElem("line", {
        "x1": 0,
        "y1": 25,
        "x2": this.mMap.width,
        "y2": 25,
        "class": "projectLine"
    }, this.elem);
    
    var milestones = Draw.svgElem("g", {
        "transform": "translate(0, 25)"
    }, this.elem);
    this.milestones.forEach(milestone => {
        var current = milestone.currentReport();
        if (current) {
            this.elem.appendChild (milestone.currentReport().drawLine());
        }
        milestones.appendChild (milestone.elem);
    });

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "class": "businessMsHeader",
        "transform": "translate(0, 20)"
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
