'use strict'

var Programme = function (obj, index, mMap) {
    // state
    this.name;

    // view
    this.elem = Draw.svgElem("g", {
        "class": "programme"
    });

    // view model
    this.mMap = mMap;
    this.index = index;
    this.height = Programme.HEADERHEIGHT;
    this.projects = [];

    this.restore (obj);
};
Programme.HEADERHEIGHT = 40;

Programme.prototype.restore = function (obj) {
    this.name = obj.name;
};
Programme.prototype.save = function () {
    return {name: this.name};
};

// depends on projects already being drawn correctly
Programme.prototype.draw = function () {
    this.elem.innerHTML = "";

    // this group stops multiple click events on the parent elem occuring
    var g = Draw.svgElem ("g", {
        "class": "programmeHeader"
    } , this.elem);
    Draw.fixedXElement(0, 0, g, this.mMap.scrollbox);
    
    var textBox = new Draw.svgTextInput (
        this.name, Draw.ALIGNLEFT, this.mMap.unclicker,
        this.modifyName.bind(this), {
            "transform": "translate(0, 25)"
        }, g);

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
    this.mMap.addProject ({
        "name": "New Project",
        "programme": this.index
    });

    this.mMap.draw();
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
    this.mMap.draw();
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
    this.mMap.draw();
};

Programme.prototype.deleteDraw = function () {
    this.deleteThis();
    this.mMap.draw();
};

    
