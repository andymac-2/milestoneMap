'use strict'

var Project = function (obj, index, mMap) {
    // state
    this.name;
    this.programme;

    // view
    this.elem = Draw.svgElem("g", {
        "class": "project"
    }, mMap.programmes[obj.programme].elem);

    // view model
    this.mMap = mMap;
    this.height = Project.HEIGHT;
    this.milestones = [];
    this.index = index;
    this.restore (obj);
};


Project.MINHEIGHT = 40;
Project.MILESTONEOFFSET = 20;
Project.prototype.restore = function (obj) {
    this.name = obj.name;

    if (this.programme) {
        this.programme.removeProject(this);
    }
    
    this.programme = this.mMap.programmes[obj.programme];
    this.programme.addProject (this);
};
Project.prototype.save = function () {
    assert (() => this.mMap.programmes[this.programme.index] === this.programme)
    return {name: this.name, programme: this.programme.index};
};
Project.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    this.flowMilestoneData();
    
    var milestones = Draw.svgElem("g", {
        "transform": "translate(0, " + (this.height - Project.MILESTONEOFFSET) + ")"
    });
    this.elem.insertBefore(milestones, this.elem.firstChild);
    this.milestones.forEach(milestone => milestones.appendChild(milestone.elem));

    var line = Draw.svgElem("line", {
        "x1": 0,
        "y1": (this.height - Project.MILESTONEOFFSET),
        "x2": this.mMap.width,
        "y2": (this.height - Project.MILESTONEOFFSET),
        "class": "projectLine"
    });
    this.elem.insertBefore(line, this.elem.firstChild);

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "class": "projectHeader",
        "transform": "translate(20, " + (this.height - 30) + ")"
    } , this.elem);
    
    var name = new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
        }, g);

    var menu = Draw.menu (Draw.ALIGNLEFT, this.mMap.unclicker, [{
        "icon": "icons/move-down.svg",
        "action": this.moveDown.bind(this)
    },{
        "icon": "icons/move-up.svg",
        "action": this.moveUp.bind(this)
    },{
        "icon": "icons/delete.svg",
        "action": this.deleteDraw.bind(this)
    },{
        "icon": "icons/plus.svg",
        "action": this.newMilestone.bind(this)
    }], {
        "transform": "translate(180, -7)"              
    }, g);

    return this.elem;
};
Project.prototype.flowMilestoneData = function () {
    var spaces = [];
    var layers = [];

    // get current msAtReports
    var milestones = this.milestones
        .map(ms => ms.currentReport())
        .filter(msAtReport => msAtReport);

    // sort descending
    milestones.sort((a, b) => b.x - a.x);
    milestones.forEach(ms => {
        var width = ms.getInfoWidth();
        var lEdge = ms.x;
        var rEdge = lEdge + width;

        // find the first layer with no collision.
        for (var i = 0; i < spaces.length && rEdge > spaces[i]; i++) {}
        spaces[i] = lEdge;

        // add milestone to that layer. Create a new one if required
        if (!layers[i]) {
            layers[i] = Draw.svgElem("g", {
                "transform": "translate(0, " +
                    (-i * MilestoneTD.HEIGHT) + ")"
            });
        }
        layers[i].appendChild (ms.elemInfo);
        ms.drawPointer (i);
    });

    // height dependent on how many layers.
    this.height = layers.length * MilestoneTD.HEIGHT;

    // add layers from top to bottom.
    var milestoneData = Draw.svgElem ("g", {
        "transform": "translate(0, " + this.height + ")"
    }, this.elem);
    for (var i = layers.length - 1; i >= 0; i--) {
        milestoneData.appendChild(layers[i]);
    }

    this.height += Project.MINHEIGHT;

    return milestoneData;
};

// call this if the height changes.
Project.prototype.reflowUp = function () {
    this.programme.draw();
    this.mMap.reflow();
};

//linking
Project.prototype.addMilestone = function (milestone) {
    this.milestones.push (milestone);
};

Project.prototype.removeMilestone = function (milestone) {
    this.milestones = this.milestones.filter(elem => elem !== milestone);
};



// modifications
Project.prototype.modifyName = function (e, input) {
    this.name = input.text;
};
Project.prototype.deleteThis = function () {
    this.programme.removeProject (this);
    this.milestones.forEach (milestone => milestone.deleteThis());
    this.mMap.removeProject (this);
};

// user modifications
Project.prototype.deleteDraw = function () {
    this.deleteThis();
    this.reflowUp();
};

Project.prototype.newMilestone = function () {
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
    this.reflowUp();
};


Project.prototype.moveUp = function () {
    assert (() => this.programme.projects.indexOf(this) >= 0);
    var index = this.programme.projects.indexOf(this);

    // already the first element
    if (index === 0) {
        return;
    }

    var project2 = this.programme.projects[index - 1];

    Util.swapIndexedElements(this.mMap.projects, project2.index, this.index);
    Util.swapElements(this.programme.projects, this, project2);

    this.reflowUp();
};

Project.prototype.moveDown = function () {
    assert (() => this.programme.projects.indexOf(this) >= 0);
    var index = this.programme.projects.indexOf(this);

    // already the first element
    if (index === this.programme.projects.length - 1) {
        return;
    }

    var project2 = this.programme.projects[index + 1];

    Util.swapIndexedElements(this.mMap.projects, project2.index, this.index);
    Util.swapElements(this.programme.projects, this, project2);

    this.reflowUp();
};
