(function (globalScope) {

    var appInfo;
    var connectionManager;

    function defineRoute(newRoute) {

        page(newRoute.path, RouteManager.getHandler(newRoute));
    }

    function defineRoutes(routes) {

        for (var i = 0, length = routes.length; i < length; i++) {

            var currentRoute = routes[i];

            page(currentRoute.path, RouteManager.getHandler(currentRoute));
        }
    }

    function defineCoreRoutes() {

        page('*', RouteManager.ctx);
        page('*', RouteManager.authenticate);

        defineRoute({
            path: 'login',
            content: 'views/login.html'
        });
    }

    function definePluginRoutes() {

        var plugins = PluginManager.plugins();

        for (var i = 0, length = plugins.length; i < length; i++) {

            var plugin = plugins[i];
            if (plugin.getRoutes) {
                defineRoutes(plugin.getRoutes());
            }
        }
    }

    function createConnectionManager() {

        var credentialProvider = new MediaBrowser.CredentialProvider();

        connectionManager = new MediaBrowser.ConnectionManager(Logger, credentialProvider, appInfo.name, appInfo.version, appInfo.deviceName, appInfo.deviceId, appInfo.capabilities);

        Events.on(connectionManager, 'apiclientcreated', function (e, newApiClient) {

            //$(newApiClient).on("websocketmessage", Dashboard.onWebSocketMessageReceived).on('requestfail', Dashboard.onRequestFail);
        });

        define('connectionManager', [], function () {
            return connectionManager;
        });

        define('currentServer', [], function () {
            return connectionManager.getLastUsedServer();
        });
    }

    function initRequire() {

        requirejs.config({
            urlArgs: "v=" + appInfo.version,

            paths: {
                "velocity": "bower_components/velocity/velocity.min"
            },

            map: {
                '*': {
                    'css': 'js/requirecss'
                }
            }
        });

        define("connectservice", ["apiclient/connectservice"]);
    }

    function loadCoreDependencies(callback) {

        var list = [
          'bower_components/page.js/page.js',
          'bower_components/bean/bean.min',
          'js/objects',
          'js/routes'
        ];

        if (!globalScope.Promise) {
            list.push('bower_components/native-promise-only/lib/npo.src');
        }

        require(list, function (page, bean) {

            window.page = page;
            window.bean = bean;
            callback();
        });
    }

    function loadPlugins() {

        // Load installed plugins
        // Use a Promise because the web-only version won't be able access the file system, so it may have to look up the plugins from some external location

        return new Promise(function (resolve, reject) {

            var list = [
                'plugins/defaulttheme/plugin.js'
            ];

            require(list, function () {
                resolve();
            });
        });
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

    function loadDefaultTheme(callback) {

        var theme = PluginManager.plugins().filter(function (p) {
            return p.packageName == 'defaulttheme';
        })[0];

        loadTheme(theme, callback);
    }

    function loadTheme(theme, callback) {

        require(theme.getDependencies(), function () {

            document.documentElement.className = theme.getOuterClassName();

            document.querySelector('.themeContent').innerHTML = theme.getPageContent();

            callback();
        });
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

        loadCoreDependencies(function () {

            loadPlugins().then(function () {

                defineCoreRoutes();
                definePluginRoutes();

                createConnectionManager();

                // Start by loading the default theme. Once a user is logged in we can change the theme based on settings
                loadDefaultTheme(function () {
                    // TODO: Catch window unload event to try to gracefully stop any active media playback

                    //page('*', RouteManager.renderContent);
                    page();
                });
            });
        });
    }

    globalScope.App = {
        start: start
    };

    // call start unless configured not to
    if (window.location.href.toLowerCase().indexOf('autostart=false') == -1) {
        start();
    }

})(this);