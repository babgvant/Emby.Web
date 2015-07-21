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

        var baseRoute = window.location.pathname.replace('/index.html', '');
        //baseRoute = window.location.protocol + '//' + baseRoute;
        page.base(baseRoute);

        page('*', RouteManager.ctx);
        page('*', RouteManager.authenticate);

        defineRoute({
            path: '/startup/login.html',
            id: 'login',
            content: 'login.html',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/manuallogin.html',
            id: 'manuallogin',
            content: 'manuallogin.html',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/welcome.html',
            id: 'welcome',
            content: 'welcome.html',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/connectlogin.html',
            id: 'connectlogin',
            content: 'connectlogin.html',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/manualserver.html',
            id: 'manualserver',
            content: 'manualserver.html',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/selectserver.html',
            id: 'selectserver',
            content: 'selectserver.html',
            dependencies: ['startup/startup']
        });
    }

    function definePluginRoutes() {

        var plugins = Emby.PluginManager.plugins();

        for (var i = 0, length = plugins.length; i < length; i++) {

            var plugin = plugins[i];
            if (plugin.getRoutes) {
                defineRoutes(plugin.getRoutes());
            }
        }
    }

    function createConnectionManager() {

        if (!appInfo.deviceId) {
            appInfo.deviceId = MediaBrowser.generateDeviceId();
        }

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

        define('currentLoggedInServer', [], function () {
            var server = connectionManager.getLastUsedServer();

            if (server) {
                if (server.UserId && server.AccessToken) {
                    return server;
                }
            }

            return null;
        });
    }

    function initRequire() {

        var urlArgs = "v=" + appInfo.version;
        urlArgs = "t=" + new Date().getTime();

        var config = {

            urlArgs: urlArgs,

            paths: {
                "velocity": "bower_components/velocity/velocity.min"
            },

            map: {
                '*': {
                    'css': 'js/requirecss',
                    'html': 'js/requirehtml'
                }
            }
        };

        var baseRoute = window.location.href.replace('/index.html', '');

        config.baseUrl = baseRoute;

        requirejs.config(config);

        define("connectservice", ["apiclient/connectservice"]);
        define("serverdiscovery", ["apiclient/serverdiscovery"]);
        define("wakeonlan", ["apiclient/wakeonlan"]);
        define("webcomponentsjs", ["bower_components/webcomponentsjs/webcomponents-lite.min"]);
        define("type", ["bower_components/type/dist/type"]);
    }

    function loadCoreDependencies(callback) {

        var list = [
          'bower_components/page.js/page.js',
          'bower_components/bean/bean.min',
          'js/objects',
          'js/routes',
          'js/viewmanager',
          'js/globalize',
          'js/thememanager',
          'js/elements',
          'js/focusmanager',
          'js/inputmanager',
          'js/screensavermanager',
          'js/playbackmanager',

          'bower_components/keylime/keylime',

          'apiclient/logger',
          'apiclient/sha1',
          'apiclient/md5',
          'apiclient/credentials',
          'apiclient/device',
          'apiclient/store',
          'apiclient/deferred',
          'apiclient/events',
          'apiclient/ajax',
          'apiclient/apiclient',
          'apiclient/connectionmanager'
        ];

        list.push('js/defaultelements');

        if (!globalScope.Promise) {
            list.push('bower_components/native-promise-only/lib/npo.src');
        }

        require(list, function (page, bean) {

            configureKeylime();
            window.page = page;
            window.bean = bean;
            callback();
        });
    }

    function configureKeylime() {
        window.keyLime.config = window.keyLime.config || {};
        window.keyLime.config.noauto = true;

        document.addEventListener('keydown', function (evt) {

            if (evt.keyCode == 13) {
                var tag = evt.target.tagName;

                if ((evt.target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA')) {

                    window.keyLime.show();
                    evt.stopPropagation();
                    evt.preventDefault();
                    return false;
                }
            }
        }, true);
    }

    function loadPlugins() {

        // Load installed plugins
        // Use a Promise because the web-only version won't be able access the file system, so it may have to look up the plugins from some external location

        return new Promise(function (resolve, reject) {

            var list = [
                'plugins/defaulttheme/plugin.js',
                'plugins/logoscreensaver/plugin.js'
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
            deviceName: 'Web Browser'
        };
    }

    function loadDefaultTheme(callback) {

        Emby.ThemeManager.loadTheme('defaulttheme', callback);
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
                    page({
                        click: false
                    });
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

    var lastLeft;
    var lastDir;

    function moveKeyFocus(dir) {

        var selector = 'input,select,textarea,button,.focusable';

        var focused = document.activeElement;

        if (!focused) {
            var elem = document.querySelector(selector);
            if (elem) {
                Emby.FocusManager.focus(elem);
            }
        }
        else {
            var rect = focused.getBoundingClientRect(),
                hght = focused.offsetHeight,
                y = rect.top + (dir === 'down' ? hght : -hght),
                x = lastLeft;

            if (!lastLeft)
                x = lastLeft = rect.left + (focused.offsetWidth / 2);

            // As the key layout may be staggered, we should assume the user wants
            // to reach the farthest key in the direction they were going.
            // We check the location slightly to the left or right of the middle of
            // the focused key first...
            var next = document.elementFromPoint(lastDir === 'left' ? x - 10 : x + 10, y);

            // ...if there was no key at that point, try the other side
            if (!next.classList.contains('lime-key'))
                next = document.elementFromPoint(x + 10, y);
        }
    }

    //document.addEventListener('keydown', function (evt) {

    //    var key = evt.key.replace(/^Arrow/, '');

    //    switch (key) {
    //        case 'Left':
    //        case 'Right':
    //        case 'Up':
    //        case 'Down':

    //            evt.preventDefault();
    //            evt.stopPropagation();

    //            moveKeyFocus(key.toLowerCase());
    //            break;
    //    }
    //}, true);

})(this);