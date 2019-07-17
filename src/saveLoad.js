'use strict'

let cps = function (...array) {
    return array.reduce(bindCPS)
}
let bindCPS = function (func1, func2) {
    return (proceed, ...args) => {
        func1((...args_inner) => func2(proceed, ...args_inner), ...args)
    }
}

/** @constructor
    @struct */
var SaveLoad = function () {
    /** @type {string} */ this.developerKey = 'AIzaSyCYeIi5ThOCg1tPdy52ALudL_W-E_aipzo';
    /** @type {string} */ this.clientId = '899992407737-pdogm033l5v7tb2j8n2g5n4hpo3r4ftd.apps.googleusercontent.com';
    /** @type {string} */ this.scope = 'https://www.googleapis.com/auth/drive.file';
    /** @type {Array<string>} */ this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    /** @type {boolean} */ this.clientLoaded = false;
    /** @type {string} */ this.fileId = null;

    gapi.load('client:auth2:picker', () => this.initClient());
};
SaveLoad.prototype.initClient = function () {
    gapi.client.init({
        apiKey: this.developerKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scope,
    }).then(() => {
        this.clientLoaded = true;
    })
}
SaveLoad.prototype.open = function (callback) {
    if (!this.clientLoaded) {
        return;
    }
    let openFileDialog = cps(
        (proceed) => this.createPicker(proceed),
        (proceed, pickerResponse) =>
            this.openFileWithPickerResponse(proceed, pickerResponse),
    );

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        openFileDialog(callback);
    }
    else {
        cps(
            (proceed) => this.doAuth(proceed),
            (proceed) => openFileDialog(proceed),
        )(callback);
    }
}

SaveLoad.prototype.createPicker = function (callback) {
    assert(() => this.clientLoaded === true);
    assert(() => gapi.auth2.getAuthInstance().isSignedIn.get());
    let token = gapi.auth2.getAuthInstance()
        .currentUser.get()
        .getAuthResponse()
        .access_token;

    var picker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.DOCS).
        setOAuthToken(token).
        setDeveloperKey(this.developerKey).
        setCallback(callback).
        build();
    picker.setVisible(true);
}
SaveLoad.prototype.doAuth = function (callback) {
    callback = callback || function () { };
    let googleAuth = gapi.auth2.getAuthInstance()
    googleAuth.signIn({ scope: this.scope }).then(googleUser => {
        let response = googleUser.getAuthResponse();
        if (response && !response.error) {
            this.oauthToken = response.access_token;
            callback();
        }
    }).catch((error) => {
        console.error(error);
    });
}
SaveLoad.prototype.openFileWithPickerResponse = function (callback, pickerResponse) {
    assert(() => this.clientLoaded === true);
    assert(() => gapi.auth2.getAuthInstance().isSignedIn.get());
    if (pickerResponse[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        let doc = pickerResponse[google.picker.Response.DOCUMENTS][0];
        let fileId = doc[google.picker.Document.ID];

        gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        }).execute((file) => {
            this.fileId = fileId;
            callback(file);
        });
    }
}

SaveLoad.prototype.gotFile = function (file) {
    console.log(file);
}

SaveLoad.prototype.saveAs = function (callback, title, data) {
    if (!this.clientLoaded) {
        return;
    }

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        this.newFileWithTitle(callback, title, data);
    }
    else {
        cps(
            (proceed) => this.doAuth(proceed),
            (proceed) => this.newFileWithTitle(proceed, title, data)
        )(callback);
    }
};

SaveLoad.prototype.newFileWithTitle = function (callback, title, data) {
    assert(() => this.clientLoaded === true);
    assert(() => gapi.auth2.getAuthInstance().isSignedIn.get());

    const boundary = '-------10897387501935781034';
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

    var request = gapi.client.request({
        'path': '/upload/drive/v3/files',
        'method': 'POST',
        'params': { 'uploadType': 'multipart' },
        'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    request.execute(callback);
}

SaveLoad.prototype.save = function (callback, title, data) {
    if (!this.clientLoaded) {
        return;
    }
    if (this.fileId === null) {
        this.saveAs(callback, title, data);
    }
    else if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        this.saveFile(callback, data);
    }
    else {
        cps(
            (proceed) => this.doAuth(proceed),
            (proceed) => this.saveFile(proceed, data),
        )(callback)
    }
};

SaveLoad.prototype.saveFile = function (callback, data) {
    assert(() => this.clientLoaded === true);
    assert(() => this.fileId !== null);
    assert(() => gapi.auth2.getAuthInstance().isSignedIn.get());

    console.log(this.fileId);

    var request = gapi.client.request({
        'path': '/upload/drive/v3/files/' + this.fileId,
        'method': 'PATCH',
        'params': {
            'uploadType': 'media',
        },
        'body': data
    });

    request.execute(callback);
}