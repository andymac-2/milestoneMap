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


Project.HEIGHT = 70;
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

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "transform": "translate(0, 10)",
        "class": "projectHeader"
    } , this.elem);
    var name = new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
        }, g);    

    Draw.svgElem("line", {
        "x1": 0,
        "y1": 20,
        "x2": this.mMap.width,
        "y2": 20,
        "class": "projectLine"
    }, this.elem);

    var milestones = Draw.svgElem("g", {
        "transform": "translate(0 20)"
    }, this.elem);

    this.milestones.forEach(milestone => milestones.appendChild(milestone.elem));

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
        "transform": "translate(0, 30)"              
    }, g);
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
    this.programme.draw();
    this.mMap.reflow();
};

Project.prototype.newMilestone = function () {
    var milestone = this.mMap.addMilestone({
        "name": "New Milestone",
        "project": this.index
    });

    this.mMap.addMsAtReport({
        "milestone": milestone.index,
        "report": this.mMap.currReport.index,
        "comment": "",
        "status": MsAtReport.ONTRACK,
        "date": this.mMap.defaultDate()
    });

    this.mMap.draw();
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

    this.mMap.draw();
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

    this.mMap.draw();
};
