(function (globalScope) {

    var appInfo;
    var connectionManager;

    function defineRoute(newRoute) {

        var baseRoute = Emby.Page.baseUrl();

        var path = newRoute.path;

        path = path.replace(baseRoute, '');

        page(path, Emby.Page.getHandler(newRoute));
    }

    function defineRoutes(routes) {

        for (var i = 0, length = routes.length; i < length; i++) {

            var currentRoute = routes[i];

            defineRoute(routes[i]);
        }
    }

    function defineCoreRoutes() {

        var baseRoute = Emby.Page.baseUrl();

        console.log('Setting page base to ' + baseRoute);

        page.base(baseRoute);

        defineRoute({
            path: '/startup/login.html',
            id: 'login',
            transition: 'slide',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/manuallogin.html',
            id: 'manuallogin',
            transition: 'slide',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/welcome.html',
            id: 'welcome',
            transition: 'slide',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/connectlogin.html',
            id: 'connectlogin',
            transition: 'slide',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/manualserver.html',
            id: 'manualserver',
            transition: 'slide',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/startup/selectserver.html',
            id: 'selectserver',
            transition: 'slide',
            dependencies: ['startup/startup']
        });

        defineRoute({
            path: '/index.html',
            id: 'index',
            isDefaultRoute: true,
            transition: 'slide',
            dependencies: []
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
        //credentialProvider.clear();
        connectionManager = new MediaBrowser.ConnectionManager(Logger, credentialProvider, appInfo.name, appInfo.version, appInfo.deviceName, appInfo.deviceId, appInfo.capabilities);

        define('connectionManager', [], function () {
            return connectionManager;
        });
    }

    function initRequire() {

        var paths = {
            alert: "components/polymer/alert",
            confirm: "components/polymer/confirm",
            toast: "components/polymer/toast",
            loading: "components/polymer/loading",
            soundeffect: "components/soundeffect",
            appwindow: "components/appwindow"
        };

        var urlArgs = "v=" + appInfo.version;
        urlArgs = "t=" + new Date().getTime();

        var config = {

            urlArgs: urlArgs,

            paths: paths,
            map: {
                '*': {
                    'css': 'js/require/requirecss',
                    'html': 'js/require/requirehtml'
                }
            },
            shim: {
                'bower_components/sly/dist/sly.min': {
                    //These script dependencies should be loaded before loading
                    //backbone.js
                    deps: ['bower_components/jquery/dist/jquery.min'],
                    //Once loaded, use the global 'Backbone' as the
                    //module value.
                    exports: 'Sly'
                }
            }
        };

        var baseRoute = window.location.href.split('?')[0].replace('/index.html', '');
        if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.log('Setting require baseUrl to ' + baseRoute);

        config.baseUrl = baseRoute;

        requirejs.config(config);

        define("connectservice", ["apiclient/connectservice"]);
        define("serverdiscovery", ["apiclient/serverdiscovery"]);
        define("wakeonlan", ["apiclient/wakeonlan"]);
        define("webcomponentsjs", ["bower_components/webcomponentsjs/webcomponents-lite.min"]);
        define("type", ["bower_components/type/dist/type"]);
        define("Sly", ["bower_components/sly/dist/sly.min"], function () {
            return window.Sly;
        });

        define("slide-from-right-animation", ['html!bower_components/neon-animation/animations/slide-from-right-animation.html']);
        define("slide-left-animation", ['html!bower_components/neon-animation/animations/slide-left-animation.html']);
        define("slide-from-left-animation", ['html!bower_components/neon-animation/animations/slide-from-left-animation.html']);
        define("slide-right-animation", ['html!bower_components/neon-animation/animations/slide-right-animation.html']);
        define("hero-animation", ['html!bower_components/neon-animation/animations/hero-animation.html']);
        define("ripple-animation", ['html!bower_components/neon-animation/animations/ripple-animation.html']);
        define("reverse-ripple-animation", ['html!bower_components/neon-animation/animations/reverse-ripple-animation.html']);
    }

    function loadCoreDependencies(callback) {

        var list = [
          'bower_components/page.js/page.js',
          'bower_components/bean/bean.min',
          'js/pluginmanager',
          'js/routes',
          'js/viewmanager',
          'js/globalize',
          'js/thememanager',
          'js/focusmanager',
          'js/inputmanager',
          'js/screensavermanager',
          'js/playbackmanager',
          'js/audiomanager',

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
          'apiclient/connectionmanager',
          'webcomponentsjs'
        ];

        if (!globalScope.Promise) {
            list.push('bower_components/native-promise-only/lib/npo.src');
        }

        require(list, function (page, bean) {

            window.page = page;
            window.bean = bean;

            define("httpclient", [], function () {
                return window.HttpClient;
            });

            // Second level dependencies that have to be loaded after the first set
            require([
                'html!bower_components/neon-animation/neon-animated-pages.html'
            ], callback);
        });
    }

    function loadPlugins() {

        // Load installed plugins
        // Use a Promise because the web-only version won't be able access the file system, so it may have to look up the plugins from some external location

        return new Promise(function (resolve, reject) {

            var list = [
                'plugins/defaulttheme/plugin.js',
                'plugins/logoscreensaver/plugin.js',
                'plugins/keyboard/plugin.js',
                'plugins/wmctheme/plugin.js'
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

    function start(appStartInfo) {

        // Whoever calls start will supply info about the host app. If empty, assume it's just in a browser
        var isDefaultAppInfo = false;
        if (!appStartInfo) {
            appStartInfo = getDefaultAppInfo();
            isDefaultAppInfo = true;
        }

        appInfo = appStartInfo;
        appInfo.capabilities = getCapabilities(!isDefaultAppInfo);

        initRequire();

        loadCoreDependencies(function () {

            loadPlugins().then(function () {

                defineCoreRoutes();
                definePluginRoutes();

                createConnectionManager();
                loadPresentation();
            });
        });
    }

    function loadPresentation() {

        // Start by loading the default theme. Once a user is logged in we can change the theme based on settings
        loadDefaultTheme(function () {
            Emby.Page.start();
        });
    }

    function exit() {
        window.location.href = 'about:blank';
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.App = {
        start: start,
        exit: exit
    };

    // call start unless configured not to
    if (window.location.href.toLowerCase().indexOf('autostart=false') == -1) {
        start();
    } else {

        document.dispatchEvent(new CustomEvent("embyready", {}));
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