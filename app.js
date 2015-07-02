(function (globalScope) {

    var appInfo;
    var connectionManager;

    function defineCoreRoutes() {

        page('*', RouteManager.ctx);
        page('*', RouteManager.authenticate);

        defineRoute({
            path: '/login',
            content: '/views/login.html'
        });
    }

    function defineRoute(newRoute) {

        page(newRoute.path, RouteManager.getHandler(newRoute));
    }

    function defineRoutes(routes) {

        for (var i = 0, length = routes.length; i < length; i++) {

            var currentRoute = routes[i];

            page(currentRoute.path, RouteManager.getHandler(currentRoute));
        }
    }

    function definePluginRoutes() {

        var objects = ObjectManager.objects();

        for (var i = 0, length = objects.length; i < length; i++) {

            var obj = objects[i];
            if (obj.getRoutes) {
                defineRoutes(obj.getRoutes());
            }
        }
    }

    function createConnectionManager() {

        var credentialProvider = new MediaBrowser.CredentialProvider();

        connectionManager = new MediaBrowser.ConnectionManager(Logger, credentialProvider, appInfo.name, appInfo.version, appInfo.deviceName, appInfo.deviceId, appInfo.capabilities);

        $(connectionManager).on('apiclientcreated', function (e, newApiClient) {

            //$(newApiClient).on("websocketmessage", Dashboard.onWebSocketMessageReceived).on('requestfail', Dashboard.onRequestFail);
        });

        define('connectionManager', [], function () {
            return connectionManager;
        });
    }

    function initRequire() {

        requirejs.config({
            urlArgs: "v=" + appInfo.version,

            paths: {
                "velocity": "bower_components/velocity/velocity.min"
            }
        });

        define('page', ['bower_components/page.js/page']);
        define("connectservice", ["apiclient/connectservice"]);
    }

    function getSupportedRemoteCommands() {

        // Full list
        // https://github.com/MediaBrowser/MediaBrowser/blob/master/MediaBrowser.Model/Session/GeneralCommand.cs
        return [
            "GoHome",
            "GoToSettings",
            "VolumeUp",
            "VolumeDown",
            "Mute",
            "Unmute",
            "ToggleMute",
            "SetVolume",
            "SetAudioStreamIndex",
            "SetSubtitleStreamIndex",
            "DisplayContent",
            "GoToSearch",
            "DisplayMessage"
        ];
    }

    function getCapabilities(supportsPersistentIdentifier, deviceProfile) {

        var caps = {
            PlayableMediaTypes: ['Audio', 'Video'],

            SupportedCommands: getSupportedRemoteCommands(),
            SupportsPersistentIdentifier: supportsPersistentIdentifier,
            SupportsMediaControl: true,
            SupportedLiveMediaTypes: ['Audio', 'Video'],
            DeviceProfile: deviceProfile
        };

        return caps;
    }

    function getDefaultAppInfo() {

        return {
            name: 'Emby Theater',
            version: '3.0',
            deviceName: 'Web Browser',
            deviceId: MediaBrowser.generateDeviceId()
        };
    }

    function start(hostApplicationInfo) {

        // Whoever calls start will supply info about the host app. If empty, assume it's just in a browser
        var isDefaultAppInfo = false;
        if (!hostApplicationInfo) {
            hostApplicationInfo = getDefaultAppInfo();
            isDefaultAppInfo = true;
        }

        appInfo = hostApplicationInfo;
        appInfo.capabilities = getCapabilities(!isDefaultAppInfo);

        initRequire();
        defineCoreRoutes();
        definePluginRoutes();

        // TODO: Catch window unload event to try to gracefully stop any active media playback

        // There will be an async call here. Depending on the result we will either call page(), bounce to login, or bounce to startup wizard
        // Or do we call page() and then do our logic? Probably need to learn more page.js first
        page('*', RouteManager.renderContent);
        page();
    }

    globalScope.App = {
        start: start
    };

})(this);

App.start();