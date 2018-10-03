'use strict'

/** @constructor
    @struct */
var Project = function (obj, index, mMap) {
    // state
    /** @type {string} */ this.name;
    /** @type {string} */ this.comment;
    /** @type {Programme} */ this.programme;

    // view
    /** @type {Element} */ 
    this.elem = Draw.svgElem("g", {
        "class": "project"
    }, mMap.programmes[obj["programme"]].elem);
    /** @type {Element} */ this.container;
    /** @type {Element} */ this.menu;

    // view model
    /** @type {MilestoneMap} */ this.mMap = mMap;
    /** @type {number} */ this.height = 0;
    /** @type {Array<Milestone>} */ this.milestones = [];
    /** @type {number} */ this.index = index;
    /** @type {number} */ this.yOffset = 0;
    /** @type {number} */ this.pageNo = 0;

    /** @type {Draw.vertResizableForeign} */ this.headingBox;
    /** @type {number} */ this.milestoneHeight = 0;
    this.restore (obj);
};


/** @const {number} */ Project.MINHEIGHT = 40;
/** @const {number} */ Project.MILESTONEOFFSET = 20;
/** @const {number} */ Project.HEADINGOFFSET = 0;
/** @const {number} */ Project.HEADINGMARGIN = 20;
/** @const {number} */ Project.MENUOFFSET = -20;
// obj is a parsed JSON string, access members using obj["membername"]
Project.prototype.restore = function (obj) {
    runTAssert (() => typeof obj["name"] === "string");
    runTAssert (() => !obj["comment"] || typeof obj["comment"] === "string");
    runTAssert (() => Number.isInteger(obj["programme"]));
    runTAssert (() => this.mMap.programmes[obj["programme"]]);
    
    this.name = obj["name"];
    this.comment = obj["comment"] || "";

    if (this.programme) {
        this.programme.removeProject(this);
    }
    
    this.programme = this.mMap.programmes[obj["programme"]];
    this.programme.addProject (this);
};
Project.prototype.save = function () {
    assert (() => this.mMap.programmes[this.programme.index] === this.programme)
    return {
        "name": this.name,
        "programme": this.programme.index,
        "comment": this.comment
    };
};
Project.prototype.draw = function () {
    this.elem.innerHTML = "";

    //set y transform to this.height - Project.MILESTONEOFFSET later
    this.container = Draw.svgElem ("g", { }, this.elem);
    Draw.svgElem("line", {
        "x1": 0,
        "y1": 0,
        "x2": this.mMap.width,
        "y2": 0,
        "class": "projectLine"
    }, this.container);
    
    var milestoneData = this.flowMilestoneData();
    this.milestones.forEach(milestone => this.container.appendChild(milestone.elem));
    this.container.appendChild(milestoneData);

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "transform": "translate(" +
            Project.HEADINGMARGIN + " " +
            Project.HEADINGOFFSET + ")"
    }, this.container);
    this.drawHeadingBox(g);
    
    this.getHeight();

    this.container.setAttribute(
        "transform", "translate(0 " +
            (this.height - Project.MILESTONEOFFSET) + ")");
    
    // var name = new Draw.svgTextInput (
    //     this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
    //     this.modifyName.bind(this), {
    //     }, g, "Untitled");

    this.menu = Draw.menu (Draw.ALIGNLEFT, this.mMap.unclicker, [{
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
        "transform": "translate(0 " + (Project.MENUOFFSET - this.headingBox.height) + ")"
    }, g);

    return this.elem;
};

/** @this {Project|BusinessMs} */
Project.prototype.flowMilestoneData = function () {
    var spaces = [];
    var layers = [];

    // get current msAtReports
    var milestones = this.milestones
        .map(ms => ms.currentReport())
        .filter(msAtReport => msAtReport && msAtReport.isDrawable());

    // sort descending
    milestones.sort((a, b) => b.x - a.x);
    milestones.forEach(ms => {
        var lEdge = ms.x;
        
        var width1 = ms.getLine1Width();
        var rEdge1 = lEdge + width1;
        
        var width2 = ms.getLine2Width();
        var rEdge2 = lEdge + width2;

        // find the first layer with no collisions.
        for (var i = 0; i < spaces.length; i++) {
            if ((!spaces[i] || rEdge2 <= spaces[i]) &&
                (!spaces [i + 1] || rEdge1 <= spaces [i + 1]))
            {
                break;
            }
        }
        // insert layer, if comment exists, add that too.
        spaces[i + 1] = lEdge;
        if (width2 !== 0) {
            spaces [i] = lEdge;
        }

        // add milestone to that layer. Create a new one if required
        if (!layers[i]) {
            layers[i] = Draw.svgElem("g", {
                "transform": "translate(0, " +
                    (-i * MilestoneTD.HEIGHT / 2) + ")"
            });
        }
        layers[i].appendChild (ms.elemInfo);
        ms.drawPointer (i);
    });

    // height dependent on how many layers.
    this.milestoneHeight = layers.length * MilestoneTD.HEIGHT / 2;

    // add layers from top to bottom.
    var milestoneData = Draw.svgElem ("g", {
        "transform": "translate(0 " + (-Project.MILESTONEOFFSET) + ")"
    });
    for (var i = layers.length - 1; i >= 0; i--) {
        if (layers[i]) {
            milestoneData.appendChild(layers[i]);
        }
    }

    this.milestoneHeight += Project.MINHEIGHT;

    return milestoneData;
};

Project.PARAGRAPHMARGIN = 4;
Project.prototype.drawHeadingBox = function (parent) {
    var usableWidth = this.mMap.getSideBarWidth() -
        Project.HEADINGMARGIN;
    this.headingBox = new Draw.vertResizableForeign (
        usableWidth, Project.PARAGRAPHMARGIN, {}, parent);
    
    new Draw.editableParagraph (this.name, {
        unclicker: this.mMap.unclicker,
        defaultText: "Untitled",
        onchange: this.modifyName.bind(this)
    }, {
        "class": "projectHeader"
    }, this.headingBox.container);

    new Draw.editableParagraph (this.comment, {
        unclicker: this.mMap.unclicker,
        defaultText: "...",
        onchange: this.modifyComment.bind(this)
    }, {
        "class": "headingComment"
    }, this.headingBox.container);
    
    this.headingBox.update();
    this.headingBox.elem.addEventListener ("verticalResize", this.adjustHeight.bind(this));
};

Project.prototype.adjustHeight = function () {
    var oldHeight = this.height;
    this.getHeight();

    if (this.menu) {
        this.menu.setAttribute(
            "transform", "translate(0 " +
                (Project.MENUOFFSET - this.headingBox.height) + ")");
    }

    if (oldHeight === this.height) {
        return;
    }
    this.container.setAttribute(
        "transform", "translate(0 " +
            (this.height - Project.MILESTONEOFFSET) + ")");
    this.reflowUp();
};

Project.HEADERVERTMARGIN = 15;
Project.prototype.getHeight = function () {
    var a = this.headingBox.height + Project.HEADERVERTMARGIN;
    var b = this.milestoneHeight;
    return this.height = Util.max(a, b);
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
Project.prototype.modifyComment = function (e, input) {
    this.comment = input.text;
};

Project.prototype.deleteThis = function () {
    this.programme.removeProject (this);
    this.milestones.forEach (milestone => milestone.deleteThis());
    this.mMap.removeProject (this);
};
Project.prototype.moveUpProgramme = function () {
    assert(() => this.programme.projects.indexOf(this) === 0);
    assert(() => Util.isSortedByIndex(this.programme.projects));
    var index = this.programme.index;
    
    // already the first programme
    if (index <= 0) {
        return;
    }

    this.programme.projects.shift();
    Util.removeFromIndexedArray(this.mMap.projects, this);

    index--;
    this.programme = this.mMap.programmes[index];
    assert(() => Util.isSortedByIndex(this.programme.projects));

    var lastProject =
        this.programme.projects[this.programme.projects.length - 1];
    this.programme.addProject(this);

    if (lastProject) {
        Util.addToIndexedArray(this.mMap.projects, this, lastProject.index + 1);
    }
    else {
        Util.addToIndexedArrayEnd(this.mMap.projects, this);
    }
    assert(() => Util.isSortedByIndex(this.mMap.projects));
};

Project.prototype.moveDownProgramme = function () {
    assert(() => this.programme.projects.indexOf(this) ===
           this.programme.projects.length - 1);
    assert(() => Util.isSortedByIndex(this.programme.projects));
    var index = this.programme.index;
    
    // already the last programme
    if (index >= this.mMap.programmes.length - 1) {
        return;
    }

    this.programme.projects.pop();
    Util.removeFromIndexedArray(this.mMap.projects, this);

    index++;
    this.programme = this.mMap.programmes[index];
    assert(() => Util.isSortedByIndex(this.programme.projects));

    var firstProject = this.programme.projects[0];
    this.programme.projects.unshift(this);

    if (firstProject) {
        Util.addToIndexedArray(this.mMap.projects, this, firstProject.index);
    }
    else {
        Util.addToIndexedArrayEnd(this.mMap.projects, this);
    }
    assert(() => Util.isSortedByIndex(this.mMap.projects));
};

// user modifications
Project.prototype.deleteDraw = function () {
    this.deleteThis();
    this.reflowUp();
};

/** @this {Project|BusinessMs} */
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
        var programme = this.programme;
        this.moveUpProgramme();
        programme.draw();
        this.reflowUp();
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
        var programme = this.programme;
        this.moveDownProgramme();
        programme.draw();
        this.reflowUp();
        return;
    }

    var project2 = this.programme.projects[index + 1];

    Util.swapIndexedElements(this.mMap.projects, project2.index, this.index);
    Util.swapElements(this.programme.projects, this, project2);

    this.reflowUp();
};
