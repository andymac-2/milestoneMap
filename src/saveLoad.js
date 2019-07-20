'use strict'

class FileError extends Error {
    constructor(msg) {
        super("Error saving/loading file: " + msg);
        this.name = "NotYetLoadedError"
    }
}

let cps = function (...array) {
    return array.reduceRight((func2, func1) => bindCPS(func1, func2))
}
let bindCPS = function (func1, func2) {
    return (proceed, ...args) => {
        func1((...args_inner) => func2(proceed, ...args_inner), ...args)
    }
}

/** @constructor
    @struct */
var SaveLoadGoogle = function () {
    /** @type {string} */ this.developerKey = 'AIzaSyCYeIi5ThOCg1tPdy52ALudL_W-E_aipzo';
    /** @type {string} */ this.clientId = '899992407737-pdogm033l5v7tb2j8n2g5n4hpo3r4ftd.apps.googleusercontent.com';
    /** @type {string} */ this.scope = 'https://www.googleapis.com/auth/drive.file';
    /** @type {Array<string>} */ this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    /** @type {boolean} */ this.clientLoaded = false;
    /** @type {?string} */ this.fileId = null;

    window["gapi"]["load"]('client:auth2:picker', () => this.initClient());
};
SaveLoadGoogle.prototype.isFileOpen = function () {
    return this.fileId !== null;
};
SaveLoadGoogle.prototype.reset = function () {
    this.fileId = null;
};
SaveLoadGoogle.prototype.saveAs = function (callback, fail, title, data) {
    if (!this.clientLoaded) {
        fail();
        return;
    }

    if (this.isSignedIn()) {
        this.newFileWithTitle(callback, fail, title, data);
    }
    else {
        cps(
            (proceed) => this.doAuth(proceed, fail),
            (proceed) => this.newFileWithTitle(proceed, fail, title, data)
        )(callback);
    }
};
SaveLoadGoogle.prototype.save = function (callback, fail, data) {
    assert(() => this.isFileOpen());
    if (!this.clientLoaded) {
        fail();
        return;
    }
    if (this.isSignedIn()) {
        this.saveFile(callback, fail, data);
    }
    else {
        cps(
            (proceed) => this.doAuth(proceed, fail),
            (proceed) => this.saveFile(proceed, fail, data),
        )(callback)
    }
};
SaveLoadGoogle.prototype.open = function (callback, fail) {
    if (!this.clientLoaded) {
        return;
    }
    let openFileDialog = cps(
        (proceed) => this.createPicker(proceed),
        (proceed, pickerResponse) =>
            this.openFileWithPickerResponse(proceed, fail, pickerResponse),
    );

    if (this.isSignedIn()) {
        openFileDialog(callback);
    }
    else {
        cps(
            (proceed) => this.doAuth(proceed, fail),
            (proceed) => openFileDialog(proceed),
        )(callback);
    }
};

SaveLoadGoogle.prototype.initClient = function () {
    window["gapi"]["client"]["init"]({
        "apiKey": this.developerKey,
        "clientId": this.clientId,
        "discoveryDocs": this.discoveryDocs,
        "scope": this.scope,
    }).then(() => {
        this.clientLoaded = true;
    })
};
SaveLoadGoogle.prototype.isSignedIn = function () {
    return this.clientLoaded &&
        window["gapi"]["auth2"]["getAuthInstance"]()["isSignedIn"]["get"]();
};
SaveLoadGoogle.prototype.getToken = function () {
    assert(() => this.isSignedIn());
    let authInstance = window["gapi"]["auth2"]["getAuthInstance"]();
    let currentUser = authInstance["currentUser"]["get"]();
    let authResponse = currentUser["getAuthResponse"]();
    return authResponse["access_token"];
};
SaveLoadGoogle.prototype.createPicker = function (callback) {
    assert(() => this.clientLoaded === true);
    assert(() => this.isSignedIn());

    const DOCS = window["google"]["picker"]["ViewId"]["DOCS"];

    var picker = new window["google"]["picker"]["PickerBuilder"]()
    ["addView"](DOCS)
    ["setOAuthToken"](this.getToken())
    ["setDeveloperKey"](this.developerKey)
    ["setCallback"](callback)
    ["build"]();

    picker["setVisible"](true);
}
SaveLoadGoogle.prototype.doAuth = function (callback, fail) {
    assert(() => this.clientLoaded === true);
    callback = callback || function () { };
    let googleAuth = window["gapi"]["auth2"]["getAuthInstance"]()
    googleAuth["signIn"]({ "scope": this.scope }).then(googleUser => {
        let response = googleUser["getAuthResponse"]();
        if (response && !response["error"]) {
            callback();
        }
        else {
            fail();
        }
    }).catch(() => {
        fail();
    });
}
SaveLoadGoogle.prototype.openFileWithPickerResponse = function (callback, fail, pickerResponse) {
    assert(() => this.clientLoaded === true);
    assert(() => this.isSignedIn());

    const RESPONSE_ACTION = window["google"]["picker"]["Response"]["ACTION"];
    const RESPONSE_DOCUMENTS = window["google"]["picker"]["Response"]["DOCUMENTS"];
    const ACTION_PICKED = window["google"]["picker"]["Action"]["PICKED"];
    const DOCUMENT_ID = window["google"]["picker"]["Document"]["ID"];

    if (pickerResponse[RESPONSE_ACTION] == ACTION_PICKED) {
        let doc = pickerResponse[RESPONSE_DOCUMENTS][0];
        let fileId = doc[DOCUMENT_ID];

        window["gapi"]["client"]["drive"]["files"]["get"]({
            'fileId': fileId,
            'alt': 'media'
        })["execute"](file => {
            callback(file);
        });
    }
    else {
        fail();
    }
}
SaveLoadGoogle.prototype.newFileWithTitle = function (callback, fail, title, data) {
    assert(() => this.clientLoaded === true);
    assert(() => this.isSignedIn());

    const boundary = '-------1089738750193135781034';
    const newline = "\r\n";
    const delimiter = newline + "--" + boundary + newline;
    const close_delim = newline + "--" + boundary + "--";

    const contentType = 'application/json';

    let metadata = {
        'name': title + ".json",
        'mimeType': contentType
    };

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json' + newline + newline +
        JSON.stringify(metadata) +

        delimiter +
        'Content-Type: ' + contentType + newline + newline +
        data +

        close_delim;

    var request = window["gapi"]["client"]["request"]({
        'path': '/upload/drive/v3/files',
        'method': 'POST',
        'params': { 'uploadType': 'multipart' },
        'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    request["execute"](fileResource => {
        if (fileResource["name"] === undefined) {
            fail();
        }
        else {
            callback(fileResource["name"]);
        }
    });
}
SaveLoadGoogle.prototype.saveFile = function (callback, fail, data) {
    assert(() => this.clientLoaded === true);
    assert(() => this.fileId !== null);
    assert(() => this.isSignedIn());

    console.log(this.fileId);

    var request = window["gapi"]["client"]["request"]({
        'path': '/upload/drive/v3/files/' + this.fileId,
        'method': 'PATCH',
        'params': {
            'uploadType': 'media',
        },
        'body': data
    });

    request["execute"](fileResource => {
        if (fileResource["name"] === undefined) {
            fail();
        }
        else {
            callback(fileResource["name"]);
        }
    });
}

var SaveLoadOnedrive = function () {
    /** @type {?Object} */ this.file = null;
    /** @type {?string} */ this.accessToken = null;
};
SaveLoadOnedrive.CLIENT_ID = "3f9462f2-10c5-4686-a3ba-8eb21ea94ab9";
SaveLoadOnedrive.SCOPES = ["Files.ReadWrite"];
SaveLoadOnedrive.prototype.reset = function () {
    this.fileId = null;
};
SaveLoadOnedrive.prototype.isFileOpen = function () {
    return this.fileId !== null;
};
SaveLoadOnedrive.prototype.open = function (callback, fail) {
    cps(
        (proceed) => {
            window["OneDrive"]["open"]({
                "clientId": SaveLoadOnedrive.CLIENT_ID,
                "action": "download",
                "multiSelect": false,
                "advanced": {
                    "filter": ".json",
                    "scopes": SaveLoadOnedrive.SCOPES,
                },
                "success": proceed,
                "cancel": fail,
                "error": fail,
            });
        },
        (proceed, response) => {
            this.accessToken = response["accessToken"];
            if (response && response["value"] && response["value"].length > 0) {
                this.file = response["value"][0];

                let url = this.file["@microsoft.graph.downloadUrl"];
                fetch(url).then(proceed, fail);
            }
            else {
                fail(response);
            }
        },
        (proceed, response) => {
            response.json().then(proceed, fail);
        }
    )(callback);
};
SaveLoadOnedrive.prototype.saveAs = function (callback, fail, title, data) {
    cps(
        (proceed) => {
            window["OneDrive"]["save"]({
                "clientId": SaveLoadOnedrive.CLIENT_ID,
                "action": "query",
                "advanced": {
                    "queryParameters": "select=id,name,parentReference",
                    "scopes": SaveLoadOnedrive.SCOPES,
                },
                "success": proceed,
                "cancel": fail,
                "error": fail,
            });
        },
        (proceed, response) => {
            console.log(response);
            this.accessToken = response["accessToken"];
            if (response && response["value"] && response["value"].length > 0) {
                let folder = response["value"][0];
                let url = response["apiEndpoint"] + "drives/" +
                    folder["parentReference"]["driveId"] + "/items/" +
                    folder["id"] + "/children/" +
                    "abcd.json" + "/content"

                fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Authorization": "Bearer" + this.accessToken,
                    },
                    body: data,
                }).then(proceed, fail);
            }
            else {
                fail(response);
            }
        },
        (proceed, response) => {
            console.log(response);
        }
    )(callback);
};
SaveLoadOnedrive.prototype.doAuth = function (callback, fail) {
    this.msalInstance.loginPopup({
        scopes: SaveLoadOnedrive.SCOPES,
    }).then(response => callback(response.accessToken), fail);
};
SaveLoadOnedrive.prototype.getToken = function (callback, fail) {
    this.msalInstance.acquireTokenSilent({
        scopes: SaveLoadOnedrive.SCOPES,
    }).then(response => callback(response.accessToken), fail);
};

var generateGraphUrl = function (driveItem, targetParentFolder, itemRelativeApiPath) {
    var url = "https://graph.microsoft.com/v1.0/";
    if (targetParentFolder) {
        url += "drives/" + driveItem.parentReference.driveId + "/items/" + driveItem.parentReference.id + "/children/" + driveItem.name;
    } else {
        url += "drives/" + driveItem.parentReference.driveId + "/items/" + driveItem.id;
    }

    if (itemRelativeApiPath) {
        url += itemRelativeApiPath;
    }
    return url;
}