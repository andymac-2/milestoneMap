'use strict'

/** @constructor
    @struct */
var Dependency = function (obj, index, mMap) {
    //state
    /** @type {MsAtReport} */ this.dependency;
    /** @type {MsAtReport} */ this.dependent;
    /** @type {Report} */ this.report;

    // view
    /** @type {Element} */
    this.elem = Draw.svgElem("g", {
        "class": "dependency"
    });
    this.elem.addEventListener("dblclick", this.deleteDraw.bind(this));

    // model
    /** @type {boolean} */ this.selected = false;
    /** @type {number} */ this.index = index;
    /** @type {MilestoneMap} */ this.mMap = mMap;

    this.restore(obj);
};
Dependency.HSPACE = 30;
Dependency.VSPACE = 30;

Dependency.prototype.restore = function (obj) {
    runTAssert(() => Number.isInteger(obj["report"]));
    runTAssert(() => this.mMap.reports[obj["report"]]);
    runTAssert(() => Number.isInteger(obj["dependent"]));
    runTAssert(() => this.mMap.milestones[obj["dependent"]]);
    runTAssert(() => Number.isInteger(obj["dependency"]));
    runTAssert(() => this.mMap.milestones[obj["dependency"]]);

    this.report = this.mMap.reports[obj["report"]];

    if (this.dependent) {
        this.dependent.removeDependency(this);
    }

    this.dependent = this.mMap.milestones[obj["dependent"]].hasReport(this.report);
    runTAssert(() => this.dependent);
    this.dependent.addDependency(this);

    if (this.dependency) {
        this.dependency.removeDependent(this);
    }

    this.dependency = this.mMap.milestones[obj["dependency"]].hasReport(this.report);
    runTAssert(() => this.dependency);
    this.dependency.addDependent(this);
};


Dependency.prototype.save = function () {
    assert(() => this.mMap.msAtReports[this.dependency.index] ===
        this.dependency);
    assert(() => this.mMap.msAtReports[this.dependent.index] ===
        this.dependent);
    assert(() => this.mMap.milestones[this.dependency.milestone.index] ===
        this.dependency.milestone);
    assert(() => this.mMap.milestones[this.dependent.milestone.index] ===
        this.dependent.milestone);


    return {
        "dependent": this.dependent.milestone.index,
        "dependency": this.dependency.milestone.index,
        "report": this.report.index
    };
};

Dependency.prototype.draw = function () {
    this.elem.innerHTML = "";

    // TODO: somehow draw and signify milestones that are off the sides of the page.
    if (this.report !== this.mMap.currReport ||
        !this.dependent.isDrawable() || !this.dependency.isDrawable()) {
        return;
    }

    var start = this.dependency.getXY();
    //start.x +=  MsAtReport.DIAMONDSIZE;
    var end = this.dependent.getXY();

    this.drawLine(start, end, this.elem);
};

Dependency.LINESTRENGTH = 150;
Dependency.prototype.drawLine = function (start, end, parent) {
    if (this.dependency.date <= this.dependent.date) {
        var lineClass = "dependencyLineOK"
        var arrowClass = "dependencyArrowOK"
    }
    else {
        lineClass = "dependencyLineLate"
        arrowClass = "dependencyArrowLate"
    }

    end.x -= MsAtReport.DIAMONDSIZE;

    Draw.sLine(start, end, Dependency.LINESTRENGTH, lineClass, parent);
    Draw.sLine(start, end, Dependency.LINESTRENGTH, "vthick transparentLine",
        parent);

    Draw.svgElem("path", {
        "class": arrowClass,
        "d": "M -4 -4 L -4 4 L 0 0 Z",
        "transform": "translate(" + end.x + ", " + end.y + ")"
    }, parent);
};

Dependency.guid = 0;
Dependency.getGUID = function () {
    Dependency.guid++;
    return Dependency.guid;
};

Dependency.spaces = "\xA0\xA0\xA0\xA0";
Dependency.prototype.drawLineOverPage = function (start, end, elem) {
    this.drawLine(start, end, elem);
    var line = Draw.sLine(start, end, Dependency.LINESTRENGTH,
        "transparentLine", elem);
    var id = "dependency" + Dependency.getGUID();
    line.setAttribute("id", id);

    var startText = Draw.svgElem("text", {
        "class": "dependencyText"
    }, elem);
    var text1 = Draw.svgElem("textPath", {
        'xlink:href': "#" + id
    }, startText);
    text1.textContent = Dependency.spaces + this.dependent.milestone.name;
    //text1.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#" + id);

    var endText = Draw.svgElem("text", {
        "text-anchor": "end",
        "class": "dependencyText"
    }, elem);
    var text2 = Draw.svgElem("textPath", {
        'xlink:href': "#" + id,
        "startOffset": "100%"
    }, endText);
    text2.textContent = this.dependency.milestone.name + Dependency.spaces;
    //text2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "#" + id);
};

Dependency.prototype.drawPrint = function (depLayers) {
    if (this.report !== this.mMap.currReport ||
        !this.dependent.isDrawable() || !this.dependency.isDrawable()) {
        return;
    }

    // TODO fix getXY code to work on pages
    var start = this.dependency.getXYPrint();
    var end = this.dependent.getXYPrint();
    var dependentPage = this.dependent.milestone.project.pageNo;
    var dependencyPage = this.dependency.milestone.project.pageNo;

    if (dependentPage === dependencyPage) {
        var elem = Draw.svgElem("g", {
            "class": "dependency"
        }, depLayers[dependentPage]);
        this.drawLine(start, end, elem);
    }
    else {
        var height = this.mMap.pageSize.height * MilestoneMap.prototype.PX_PER_MM;
        if (dependentPage > dependencyPage) {
            var otherEndY = end.y + height;
            var otherStartY = start.y - height;
        }
        else {
            otherEndY = end.y - height;
            otherStartY = start.y + height;
        }

        var elem1 = Draw.svgElem("g", {
            "class": "dependency"
        }, depLayers[dependencyPage]);
        var elem2 = Draw.svgElem("g", {
            "class": "dependency"
        }, depLayers[dependentPage]);

        this.drawLineOverPage(
            start, { x: end.x, y: otherEndY }, elem1);
        this.drawLineOverPage(
            { x: start.x, y: otherStartY }, end, elem2);
    }
};

// modifications
Dependency.prototype.deleteThis = function () {
    this.dependency.removeDependent(this);
    this.dependent.removeDependency(this);

    this.mMap.removeDependency(this);
};


// user events
Dependency.prototype.deleteDraw = function () {
    this.deleteThis();

    this.elem.parentNode.removeChild(this.elem);
};
