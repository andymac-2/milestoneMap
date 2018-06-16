'use strict'

/** @constructor
    @struct */
var Programme = function (obj, index, mMap) {
    // state
    /** @type {string} */ this.name;

    // view
    /** @type {Element} */ 
    this.elem = Draw.svgElem("g", {
        "class": "programme"
    });

    // view model
    /** @type {MilestoneMap} */  this.mMap = mMap;
    /** @type {number} */ this.index = index;
    /** @type {number} */ this.height = Programme.HEADERHEIGHT;
    /** @type {Array<Project>} */ this.projects = [];
    /** @type {number} */ this.yOffset = 0;

    this.restore (obj);
};
/** @const {number} */ Programme.HEADERHEIGHT = 40;

Programme.prototype.restore = function (obj) {
    runTAssert (() => typeof obj["name"] === "string");
    this.name = obj["name"];
};
Programme.prototype.save = function () {
    return {"name": this.name};
};

// depends on projects already being drawn correctly
Programme.prototype.draw = function () {
    this.elem.innerHTML = "";

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "class": "programmeHeader"
    } , this.elem);
    
    var textBox = new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
            "transform": "translate(0, 25)"
        }, g, "Untitled");

    Draw.menu (Draw.ALIGNLEFT, this.mMap.unclicker, [{
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
        "action": this.newProject.bind(this)
    }], {
        "transform": "translate(180, 20)"
    }, g);

    this.projects.forEach(project => this.elem.appendChild (project.elem));
    this.height = Draw.verticalReflow (Programme.HEADERHEIGHT, this.projects);

    return this.elem;
};

Programme.prototype.reflow = function () {
    this.height = Draw.verticalReflow (Programme.HEADERHEIGHT, this.projects);
    return this.elem;
}

Programme.prototype.drawPrint = function (spaceLeft, startIndex, first, pageNo) {
    var saveStartIndex = startIndex;
    var printable = Draw.svgElem ("g", {
        "class": "programme"
    });

    var g = Draw.svgElem ("g", {
        "class": "programmeHeader"
    }, printable);
    
    var textBox = new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
            "transform": "translate(0, 25)"
        }, g, "Untitled");

    var yOffset = Programme.HEADERHEIGHT;
    for (var projects = [];
         startIndex < this.projects.length && yOffset < spaceLeft;
         startIndex++)
    {
        var project = this.projects[startIndex];
        project.pageNo = pageNo;
        project.elem.setAttribute("transform", "translate(0, " + yOffset + ")");
        project.yOffset = yOffset + this.yOffset;
        projects.push (project);
        yOffset += project.height;
    }

    // all fit
    if (yOffset < spaceLeft) {
        projects.forEach(project => printable.appendChild (project.elem));
        return {
            elem: printable,
            spaceLeft: spaceLeft - yOffset,
            index: this.projects.length
        };
    }
    // the header doesn't fit on an entire page
    else if (projects.length === 0 && first) {
        throw new Error ("Not enough room on page for programme headers.");
    }
    // the first project doesn't fit on an entire page
    else if (projects.length === 1 && first) {
        throw new Error (
            "Project: '" + projects[0].name +
                "' is larger than a single page, and cannot be printed");
    }
    // the first project doesn't fit, but we can put it on the next page
    else if (projects.length <= 1) {
        return {
            elem: Draw.svgElem ("g", {}),
            spaceLeft: 0,
            index: saveStartIndex
        };
    }
    // some projects fit, but not all
    else {
        projects.pop();
        projects.forEach(project => printable.appendChild (project.elem));
        return {
            elem: printable,
            spaceLeft: 0,
            index: startIndex - 1
        }
    }
};

// linking
Programme.prototype.addProject = function (project) {
    this.projects.push (project);
};
Programme.prototype.removeProject = function (project) {
    this.projects = this.projects.filter (elem => elem !== project);
};

// modifications
Programme.prototype.modifyName = function (e, input) {
    this.name = input.text;
};
Programme.prototype.deleteThis = function () {
    this.projects.forEach(project => project.deleteThis());
    this.mMap.removeProgramme (this);
};

// user events
Programme.prototype.newProject = function () {
    var project = this.mMap.addProject ({
        "name": "New Project",
        "programme": this.index
    });

    project.draw();
    this.draw();
    this.mMap.reflow();
};

Programme.prototype.moveUp = function () {
    assert (() => this.mMap.programmes.indexOf(this) >= 0);
    var index = this.mMap.programmes.indexOf(this);

    // already the first element
    if (index === 0) {
        return;
    }

    var programme2 = this.mMap.programmes[index - 1];
    Util.swapIndexedElements(this.mMap.programmes, programme2.index, this.index);
    this.mMap.reflow();
};

Programme.prototype.moveDown = function () {
    assert (() => this.mMap.programmes.indexOf(this) >= 0);
    var index = this.mMap.programmes.indexOf(this);

    // already the last element
    if (index === this.mMap.programmes.length - 1) {
        return;
    }

    var programme2 = this.mMap.programmes[index + 1];
    Util.swapIndexedElements(this.mMap.programmes, programme2.index, this.index);
    this.mMap.reflow();
};

Programme.prototype.deleteDraw = function () {
    this.deleteThis();
    this.mMap.draw();
};

    
