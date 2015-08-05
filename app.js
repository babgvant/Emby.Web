(function (globalScope) {

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

        var baseRoute = window.location.pathname.replace('/index.html', '');
        if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.log('Setting page base to ' + baseRoute);

        page.base(baseRoute);

        var deps = ['startup/startup'];
        var startupRoot = '/startup/';

        defineRoute({
            path: startupRoot + 'login.html',
            id: 'login',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'manuallogin.html',
            id: 'manuallogin',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'welcome.html',
            id: 'welcome',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'connectlogin.html',
            id: 'connectlogin',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'manualserver.html',
            id: 'manualserver',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'selectserver.html',
            id: 'selectserver',
            transition: 'slide',
            dependencies: deps
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

    function getCapabilities(apphost) {

        var caps = apphost.capabilities();

        // Full list
        // https://github.com/MediaBrowser/MediaBrowser/blob/master/MediaBrowser.Model/Session/GeneralCommand.cs
        caps.SupportedCommands = [
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

        caps.SupportsMediaControl = true;
        caps.SupportedLiveMediaTypes = caps.PlayableMediaTypes;

        return caps;
    }

    function createConnectionManager() {

        return new Promise(function (resolve, reject) {

            require(['apphost'], function (apphost) {

                var credentialProvider = new MediaBrowser.CredentialProvider();
                //credentialProvider.clear();
                connectionManager = new MediaBrowser.ConnectionManager(Logger, credentialProvider, apphost.appName(), apphost.appVersion(), apphost.deviceName(), apphost.deviceId(), getCapabilities(apphost));

                define('connectionManager', [], function () {
                    return connectionManager;
                });

                resolve();
            });
        });
    }

    function initRequire() {

        var componentType = enableWebComponents() ? 'polymer' : 'default';

        var paths = {
            alert: "components/" + componentType + "/alert",
            confirm: "components/" + componentType + "/confirm",
            toast: "components/" + componentType + "/toast",
            loading: "components/" + componentType + "/loading",
            soundeffect: "components/soundeffect",
            apphost: "components/apphost"
        };

        if (enableWebComponents()) {
            paths.viewcontainer = 'js/viewcontainer';
        } else {
            paths.viewcontainer = 'js/viewcontainer-lite';
        }

        var urlArgs = "t=" + new Date().getTime();

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
        define("fade-in-animation", ['html!bower_components/neon-animation/animations/fade-in-animation.html']);
        define("fade-out-animation", ['html!bower_components/neon-animation/animations/fade-out-animation.html']);
    }

    function enableWebComponents() {
        return true;
    }

    function loadCoreDependencies(callback) {

        var list = [
          'bower_components/page.js/page.js',
          'bower_components/bean/bean.min',
          'js/pluginmanager',
          'js/routes',
          'js/globalize',
          'js/thememanager',
          'js/focusmanager',
          'js/inputmanager',
          'js/screensavermanager',
          'js/playbackmanager',
          'js/audiomanager',
          'js/viewmanager',
          'js/imageloader',
          'js/models',
          'js/backdrops',
          'js/dom',
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

        if (enableWebComponents()) {
            list.push('webcomponentsjs');
        } else {
            // If not using webcomponents then we'll at least need the web animations polyfill
            list.push('bower_components/web-animations-js/web-animations-next.min');
        }

        if (!globalScope.Promise) {
            list.push('bower_components/native-promise-only/lib/npo.src');
        }

        require(list, function (page, bean) {

            window.page = page;
            window.bean = bean;

            define("httpclient", [], function () {
                return window.HttpClient;
            });

            var secondLevelDeps = [];

            if (enableWebComponents()) {
                secondLevelDeps.push('html!bower_components/neon-animation/neon-animated-pages.html');
            }

            // Second level dependencies that have to be loaded after the first set
            require(secondLevelDeps, callback);
        });
    }

    function loadPlugins() {

        // Load installed plugins
        // Use a Promise because the web-only version won't be able access the file system, so it may have to look up the plugins from some external location

        return new Promise(function (resolve, reject) {

            var list = [
                'plugins/defaulttheme/plugin.js',
                'plugins/logoscreensaver/plugin.js',
                'plugins/keyboard/plugin.js'
            ];

            if (enableWebComponents()) {
                list.push('plugins/wmctheme/plugin.js');
            }

            require(list, function () {
                resolve();
            });
        });
    }

    function loadDefaultTheme(callback) {

        Emby.ThemeManager.loadTheme('defaulttheme', callback);
    }

    function start(appStartInfo) {

        initRequire();

        loadCoreDependencies(function () {

            loadPlugins().then(function () {

                defineCoreRoutes();
                definePluginRoutes();

                createConnectionManager().then(loadPresentation);
            });
        });
    }

    function loadPresentation() {

        // Start by loading the default theme. Once a user is logged in we can change the theme based on settings
        loadDefaultTheme(function () {

            document.documentElement.classList.remove('preload');

            Emby.Page.start();
        });
    }

    function exit() {

        require(['apphost'], function (apphost) {

            if (apphost.supports('Exit')) {
                apphost.exit();
            } else {

                // TODO: Sign out since that's the closest thing we can do to closing the app

            }
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.App = {
        exit: exit
    };

    start();

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