define(['cryptojs-sha1'], function () {

    function getDeviceProfile() {

        // TODO
        return null;
    }

    function getCapabilities() {

        var caps = {
            PlayableMediaTypes: ['Audio', 'Video'],

            SupportsPersistentIdentifier: false,
            DeviceProfile: getDeviceProfile()
        };

        return caps;
    }

    return {
        getWindowState: function () {
            return document.windowState || 'Normal';
        },
        setWindowState: function (state) {
            alert('setWindowState is not supported and should not be called');
        },
        exit: function () {
            alert('exit is not supported and should not be called');
        },
        supports: function (command) {

            // Web-based implementation can't really do much
            return false;
        },
        appName: function () {
            return 'Emby Theater';
        },
        appVersion: function () {
            return '3.0';
        },
        deviceName: function () {
            return 'Web Browser';
        },
        deviceId: function () {
            return MediaBrowser.generateDeviceId();
        },
        capabilities: getCapabilities
    };
});