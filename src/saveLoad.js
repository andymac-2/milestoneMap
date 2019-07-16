'use strict'

/** @constructor
    @struct */
var SaveLoad = function () {
    /** @type {string} */ this.developerKey = 'AIzaSyCYeIi5ThOCg1tPdy52ALudL_W-E_aipzo';
    /** @type {string} */ this.clientId = '899992407737-pdogm033l5v7tb2j8n2g5n4hpo3r4ftd.apps.googleusercontent.com';
    /** @type {string} */ this.scope = 'https://www.googleapis.com/auth/drive.file';
    /** @type {Array<string>} */ this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];


    /** @type {boolean} */ this.clientLoaded = false;

    gapi.load('client:auth2:picker', () => this.initClient());
}

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

SaveLoad.prototype.open = function () {
    if (!this.clientLoaded) {
        return;
    }
    this.doAuth(() => this.createPicker((data) => this.openFilePickerCallback(data)));
}

SaveLoad.prototype.doAuth = function (callback) {
    let googleAuth = gapi.auth2.getAuthInstance()
    googleAuth.signIn({ scope: this.scope }).then(googleUser => {
        let response = googleUser.getAuthResponse();
        if (response && !response.error) {
            this.oauthToken = response.access_token;
            callback();
        }
    }).catch((error) => {
        console.log(error);
    });
}

SaveLoad.prototype.openFilePickerCallback = function (data) {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        let doc = data[google.picker.Response.DOCUMENTS][0];
        let id = doc[google.picker.Document.ID];

        gapi.client.drive.files.get({
            fileId: id,
            alt: 'media'
        }).execute((file) => this.gotFile(file));
    }
}

SaveLoad.prototype.gotFile = function (file) {
    console.log(file);
}

SaveLoad.prototype.createPicker = function (callback) {
    assert(() => this.clientLoaded === true);
    assert(() => gapi.auth2.getAuthInstance().isSignedIn.get());
    let token = gapi.auth2.getAuthInstance()
        .currentUser.get()
        .getAuthResponse()
        .access_token;

    var picker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.DOCUMENTS).
        setOAuthToken(token).
        setDeveloperKey(this.developerKey).
        setCallback(callback).
        build();
    picker.setVisible(true);
}

SaveLoad.prototype.saveAs = function () {

}

SaveLoad.prototype.save = function () {

}