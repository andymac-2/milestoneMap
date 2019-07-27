'use strict'

/** @constructor
    @struct */
var Loader = function (parent) {
    parent.innerHTML = "";
    //view
    /** @type {Element} */
    this.elem = Draw.htmlElem("div", {
        "class": "milestoneMapContainer"
    }, parent);

    /** @type {MilestoneMap} */ this.map;
    /** @type {Element} */ this.parent = parent;
    /** @type {Element} */ this.console;
    /** @type {SaveLoad} */ this.saveLoad = new SaveLoad();

    this.newFile();
};

Loader.prototype.restore = function (obj) {
    this.map = new MilestoneMap(obj);
};

Loader.prototype.draw = function () {
    this.elem.innerHTML = "";

    this.console = Draw.htmlElem("div", {
        "class": "console"
    }, this.elem);

    var menubar = Draw.htmlElem("div", {
        "class": "menubar"
    }, this.elem);

    var fileSegment = Draw.menuBarSegment("File", menubar);
    Draw.iconBar([{
        icon: "icons/new.svg",
        action: this.newFile.bind(this),
        mouseover: () => this.console.textContent = "New file"
    }, {
        icon: "icons/open.svg",
        action: this.open.bind(this),
        mouseover: () => this.console.textContent = "Open file from Google Drive"
    }, {
        icon: "icons/save.svg",
        action: this.save.bind(this),
        mouseover: () => this.console.textContent = "Save file"
    }, {
        icon: "icons/save-as.svg",
        action: this.saveAs.bind(this),
        mouseover: () => this.console.textContent = "Save file as"
    }, {
        icon: "icons/exportCSV.svg",
        action: this.exportCSV.bind(this),
        mouseover: () => this.console.textContent = "Export snapshot as CSV"
    }, {
        icon: "icons/import.svg",
        action: this.importCSVReport.bind(this),
        mouseover: () => this.console.textContent = "Import CSV snapshot"
    }], {}, fileSegment.body);

    var programmeSegment = Draw.menuBarSegment("Programme", menubar);
    Draw.iconBar([{
        icon: "icons/plus.svg",
        action: this.map.newProgramme.bind(this.map),
        mouseover: () => this.console.textContent = "New programme"
    }], {}, programmeSegment.body);

    var reportSegment = Draw.menuBarSegment("Comparison", menubar);
    Draw.iconBar([{
        icon: "icons/camera.svg",
        action: this.newReport.bind(this),
        mouseover: () => this.console.textContent = "New snapshot"
    }, {
        icon: "icons/delete.svg",
        action: this.deleteCurrReport.bind(this),
        mouseover: () => this.console.textContent = "Delete snapshot"
    }], {}, reportSegment.body);

    this.map.reportSelectors();
    reportSegment.body.appendChild(this.map.elemReportSelectors);

    var printSegment = Draw.menuBarSegment("Print", menubar);
    Draw.iconBar([{
        icon: "icons/print.svg",
        action: this.print.bind(this),
        mouseover: () => this.console.textContent = "Print"
    }], {}, printSegment.body);
    this.printSizeSelector({
        "class": "pageSizeSelector"
    }, printSegment.body);

    var aboutSegment = Draw.menuBarSegment("About", menubar);
    Draw.iconBar([{
        icon: "icons/info.svg",
        action: () => alert(Loader.aboutText),
        mouseover: () => this.console.textContent = "About"
    }, {
        icon: "icons/question.svg",
        action: () => window.open("https://andymac-2.github.io/milestoneMap/instructions"),
        mouseover: () => this.console.textContent = "Help"
    }], {}, aboutSegment.body);

    Draw.elem("div", {
        "class": "menuBarPlaceholder"
    }, this.elem);

    this.elem.appendChild(this.map.elemContainer);
    this.map.draw();
};


// correspond to Loader.PAGESIZENAMES
/** @const {number} */ Loader.PAGEMARGIN = 35;
/** @const {Array<Object<number>>}*/ Loader.PAGESIZES = [
    { height: 1682, width: 2378 },
    { height: 1189, width: 1682 },
    { height: 841, width: 1189 },
    { height: 594, width: 841 },
    { height: 420, width: 594 },
    { height: 297, width: 420 },
    { height: 210, width: 297 },
    { width: 1682, height: 2378 },
    { width: 1189, height: 1682 },
    { width: 841, height: 1189 },
    { width: 594, height: 841 },
    { width: 420, height: 594 },
    { width: 297, height: 420 },
    { width: 210, height: 297 },
].map(elem => {
    if (elem.width > elem.height) {
        return {
            height: elem.height - Loader.PAGEMARGIN * 2,
            width: elem.width - Loader.PAGEMARGIN * 2,
        };
    }
    else {
        return elem;
    }
});
/** @const {Object<number>}*/ Loader.A3SIZE = Loader.PAGESIZES[5];
// correspond to Loader.PAGESIZES
/** @const Array<string> */ Loader.PAGESIZENAMES = [
    "4A0 Landscape",
    "2A0 Landscape",
    "A0 Landscape",
    "A1 Landscape",
    "A2 Landscape",
    "A3 Landscape",
    "A4 Landscape",
    "4A0 Portrait",
    "2A0 Portrait",
    "A0 Portrait",
    "A1 Portrait",
    "A2 Portrait",
    "A3 Portrait",
    "A4 Portrait",
];
Loader.prototype.printSizeSelector = function (attrs, parent) {
    var onchange = (evt) => {
        this.map.pageSize = Loader.PAGESIZES[evt.currentTarget.value];
    }
    Draw.dropDownSegment(
        "Page Size:", onchange, Loader.PAGESIZENAMES, attrs, parent);
};

// modifications


// user events
Loader.prototype.newReport = function () {
    this.map.addReport({ "name": "New Report", "date": this.map.defaultDate() });
    this.draw();
};
Loader.prototype.deleteCurrReport = function () {
    if (this.map.reports.length <= 1) {
        return;
    }

    this.map.currReport.deleteThis();
    this.draw();
};

Loader.prototype.newFile = function () {
    this.saveLoad.reset();
    var now = MilestoneMap.prototype.defaultDate();
    var twoMonths = 60 * 24 * 60 * 60 * 1000;
    var twoMonthsAgo = now - twoMonths;
    var date = new Date(twoMonthsAgo);
    var nextYear = date.setUTCFullYear(date.getUTCFullYear() + 1).valueOf();

    this.map = new MilestoneMap({
        "name": "New Map",
        "start": twoMonthsAgo,
        "end": nextYear,
        "programmes": [],
        "projects": [],
        "milestones": [],
        "msAtReports": [],
        "reports": [
            { "name": "Baseline", "date": now },
        ],
        "dependencies": [],
        "currReport": 0,
        "cmpReport": 0
    });
    this.draw();
};

Loader.prototype.save = function () {
    var string = JSON.stringify(this.map.save(), null, "\t");
    this.console.textContent = "Saving..."

    let success = name => this.console.textContent = "Saved as: " + name;
    let failure = error => {
        this.console.textContent = "Error saving file"
        console.error(error);
    };

    if (this.saveLoad.isFileOpen()) {
        this.saveLoad.save(success, failure, string);
    }
    else {
        this.saveLoad.saveAs(success, failure, this.map.name + ".json", string);
    }
};
Loader.prototype.saveAs = function () {
    var string = JSON.stringify(this.map.save(), null, "\t");
    this.console.textContent = "Saving..."

    let success = name => this.console.textContent = "Saved as: " + name;
    let failure = error => {
        this.console.textContent = "Error saving file"
        console.error(error);
    };

    this.saveLoad.saveAs(success, failure, this.map.name + ".json", string);
};
Loader.prototype.open = function () {
    var restoreDraw = (obj) => {
        try {
            this.restore(obj);
            this.draw();
        }
        catch (e) {
            alert("Error: Invalid file.");
            throw e;
        }
    };
    this.saveLoad.open(restoreDraw, (err) => {
        this.console.textContent = "Error opening file"
        console.error(err);
    });
};
Loader.prototype.importCSVReport = function () {
    var restoreDraw = (string) => {
        try {
            var arr = Util.parseCSV(string);
            this.map.addReportFromCSV(arr);
            this.draw();
        }
        catch (err) {
            Util.allertErr(err);
            throw err;
        }
    };

    Util.upload(this.elem, restoreDraw, ".csv");
};

Loader.prototype.exportCSV = function () {
    var string = this.map.exportCSVMilestones();
    Util.download(this.map.name + ".csv", string, "text/csv",
        this.elem);
};

Loader.prototype.print = function () {
    var mMap = new MilestoneMap(this.map.save(), this.map.pageSize);

    try {
        mMap.drawPrint();
        this.parent.innerHTML = mMap.printElem.innerHTML;
        window.print();
        this.parent.innerHTML = "";
        this.parent.appendChild(this.elem);

        //newWindow.close();
    }
    catch (err) {
        Util.allertErr(err);
        throw err;
    }
};


/** @const {string} */ Loader.aboutText = `Milestone Map, Version: ` + VERSION + `

For help and support, please visit:

https://andymac-2.github.io/milestoneMap/instructions

Copyright 2018 Andrew Pritchard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



ELUSIVE ICONS:

Elusive Icons by Team Redux - http://reduxframework.com/

SIL OPEN FONT LICENSE

Version 1.1 - 26 February 2007
PREAMBLE

The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.
DEFINITIONS

"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting — in part or in whole — any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.
PERMISSION & CONDITIONS

Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.
TERMINATION

This license becomes null and void if any of the above conditions are
not met.
DISCLAIMER

THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.



GLYPH + SMART ICONS:

License http://creativecommons.org/licenses/by-sa/4.0/ (CC BY-SA 4.0)  A project by https://smarticons.co SmartIcons



MATERIAL DESIGN ICONS:

Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction,
and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by
the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all
other entities that control, are controlled by, or are under common
control with that entity. For the purposes of this definition,
"control" means (i) the power, direct or indirect, to cause the
direction or management of such entity, whether by contract or
otherwise, or (ii) ownership of fifty percent (50%) or more of the
outstanding shares, or (iii) beneficial ownership of such entity.

"You" (or "Your") shall mean an individual or Legal Entity
exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications,
including but not limited to software source code, documentation
source, and configuration files.

"Object" form shall mean any form resulting from mechanical
transformation or translation of a Source form, including but
not limited to compiled object code, generated documentation,
and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or
Object form, made available under the License, as indicated by a
copyright notice that is included in or attached to the work
(an example is provided in the Appendix below).

"Derivative Works" shall mean any work, whether in Source or Object
form, that is based on (or derived from) the Work and for which the
editorial revisions, annotations, elaborations, or other modifications
represent, as a whole, an original work of authorship. For the purposes
of this License, Derivative Works shall not include works that remain
separable from, or merely link (or bind by name) to the interfaces of,
the Work and Derivative Works thereof.

"Contribution" shall mean any work of authorship, including
the original version of the Work and any modifications or additions
to that Work or Derivative Works thereof, that is intentionally
submitted to Licensor for inclusion in the Work by the copyright owner
or by an individual or Legal Entity authorized to submit on behalf of
the copyright owner. For the purposes of this definition, "submitted"
means any form of electronic, verbal, or written communication sent
to the Licensor or its representatives, including but not limited to
communication on electronic mailing lists, source code control systems,
and issue tracking systems that are managed by, or on behalf of, the
Licensor for the purpose of discussing and improving the Work, but
excluding communication that is conspicuously marked or otherwise
designated in writing by the copyright owner as "Not a Contribution."

"Contributor" shall mean Licensor and any individual or Legal Entity
on behalf of whom a Contribution has been received by Licensor and
subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
this License, each Contributor hereby grants to You a perpetual,
worldwide, non-exclusive, no-charge, royalty-free, irrevocable
copyright license to reproduce, prepare Derivative Works of,
publicly display, publicly perform, sublicense, and distribute the
Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
this License, each Contributor hereby grants to You a perpetual,
worldwide, non-exclusive, no-charge, royalty-free, irrevocable
(except as stated in this section) patent license to make, have made,
use, offer to sell, sell, import, and otherwise transfer the Work,
where such license applies only to those patent claims licensable
by such Contributor that are necessarily infringed by their
Contribution(s) alone or by combination of their Contribution(s)
with the Work to which such Contribution(s) was submitted. If You
institute patent litigation against any entity (including a
cross-claim or counterclaim in a lawsuit) alleging that the Work
or a Contribution incorporated within the Work constitutes direct
or contributory patent infringement, then any patent licenses
granted to You under this License for that Work shall terminate
as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
Work or Derivative Works thereof in any medium, with or without
modifications, and in Source or Object form, provided that You
meet the following conditions:

(a) You must give any other recipients of the Work or
Derivative Works a copy of this License; and

(b) You must cause any modified files to carry prominent notices
stating that You changed the files; and

(c) You must retain, in the Source form of any Derivative Works
that You distribute, all copyright, patent, trademark, and
attribution notices from the Source form of the Work,
excluding those notices that do not pertain to any part of
the Derivative Works; and

(d) If the Work includes a "NOTICE" text file as part of its
distribution, then any Derivative Works that You distribute must
include a readable copy of the attribution notices contained
within such NOTICE file, excluding those notices that do not
pertain to any part of the Derivative Works, in at least one
of the following places: within a NOTICE text file distributed
as part of the Derivative Works; within the Source form or
documentation, if provided along with the Derivative Works; or,
within a display generated by the Derivative Works, if and
wherever such third-party notices normally appear. The contents
of the NOTICE file are for informational purposes only and
do not modify the License. You may add Your own attribution
notices within Derivative Works that You distribute, alongside
or as an addendum to the NOTICE text from the Work, provided
that such additional attribution notices cannot be construed
as modifying the License.

You may add Your own copyright statement to Your modifications and
may provide additional or different license terms and conditions
for use, reproduction, or distribution of Your modifications, or
for any such Derivative Works as a whole, provided Your use,
reproduction, and distribution of the Work otherwise complies with
the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
any Contribution intentionally submitted for inclusion in the Work
by You to the Licensor shall be under the terms and conditions of
this License, without any additional terms or conditions.
Notwithstanding the above, nothing herein shall supersede or modify
the terms of any separate license agreement you may have executed
with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
names, trademarks, service marks, or product names of the Licensor,
except as required for reasonable and customary use in describing the
origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
agreed to in writing, Licensor provides the Work (and each
Contributor provides its Contributions) on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied, including, without limitation, any warranties or conditions
of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
PARTICULAR PURPOSE. You are solely responsible for determining the
appropriateness of using or redistributing the Work and assume any
risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
whether in tort (including negligence), contract, or otherwise,
unless required by applicable law (such as deliberate and grossly
negligent acts) or agreed to in writing, shall any Contributor be
liable to You for damages, including any direct, indirect, special,
incidental, or consequential damages of any character arising as a
result of this License or out of the use or inability to use the
Work (including but not limited to damages for loss of goodwill,
work stoppage, computer failure or malfunction, or any and all
other commercial damages or losses), even if such Contributor
has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
the Work or Derivative Works thereof, You may choose to offer,
and charge a fee for, acceptance of support, warranty, indemnity,
or other liability obligations and/or rights consistent with this
License. However, in accepting such obligations, You may act only
on Your own behalf and on Your sole responsibility, not on behalf
of any other Contributor, and only if You agree to indemnify,
defend, and hold each Contributor harmless for any liability
incurred by, or claims asserted against, such Contributor by reason
of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

To apply the Apache License to your work, attach the following
boilerplate notice, with the fields enclosed by brackets "[]"
replaced with your own identifying information. (Don't include
the brackets!)  The text should be enclosed in the appropriate
comment syntax for the file format. We also recommend that a
file or class name and description of purpose be included on the
same "printed page" as the copyright notice for easier
identification within third-party archives.

Copyright [yyyy] [name of copyright owner]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
`;
