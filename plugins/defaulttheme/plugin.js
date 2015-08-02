(function () {

    function updateClock() {

        var date = new Date();
        var time = date.toLocaleTimeString().toLowerCase();

        if (time.indexOf('am') != -1 || time.indexOf('pm') != -1) {

            var hour = date.getHours() % 12;
            var suffix = date.getHours() > 11 ? 'pm' : 'am';
            if (!hour) {
                hour = 12;
            }
            var minutes = date.getMinutes();

            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            time = hour + ':' + minutes + suffix;
        }

        var clock = document.querySelector('.clock');

        if (clock) {
            clock.innerHTML = time;
        }
    }

    function theme() {

        var self = this;

        self.name = 'Default Theme';
        self.type = 'theme';
        self.packageName = 'defaulttheme';

        self.getHeaderTemplate = function () {
            return Emby.PluginManager.mapResource(self, 'header.html');
        };

        self.getDependencies = function () {

            var files = [
                'css!' + Emby.PluginManager.mapRequire(self, 'css/style'),
                'css!' + Emby.PluginManager.mapRequire(self, 'cards/card'),
                'css!' + Emby.PluginManager.mapRequire(self, 'css/colors.dark'),
                'css!' + Emby.PluginManager.mapRequire(self, 'css/paperstyles'),
                Emby.PluginManager.mapRequire(self, 'cards/cardbuilder.js'),
                'html!bower_components/iron-icon/iron-icon.html',
                'html!bower_components/iron-iconset-svg/iron-iconset-svg.html',
                'html!' + Emby.PluginManager.mapRequire(self, 'icons.html'),
                'html!bower_components/paper-button/paper-button.html',
                'html!bower_components/paper-icon-button/paper-icon-button.html',
                'html!bower_components/paper-input/paper-input.html',
                'html!bower_components/paper-material/paper-material.html',
                'html!bower_components/paper-progress/paper-progress.html',
                'fade-in-animation',
                'fade-out-animation'
            ];

            return files;
        };

        self.getTranslations = function () {

            var files = [];

            files.push({
                lang: 'en-us',
                path: Emby.PluginManager.mapResource(self, 'strings/en-us.json')
            });

            return files;
        };

        self.getRoutes = function () {
            // Routes, relative to the current directory. The app will handle normalizing the full path

            var routes = [];

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'home.html'),
                id: 'defaulttheme-home',
                type: 'home',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'home/home'),
                    'css!' + Emby.PluginManager.mapRequire(self, 'home/home')
                ]
            });

            return routes;
        };

        var clockInterval;
        self.load = function () {

            updateClock();
            setInterval(updateClock, 50000);
            bindEvents();
            loadControlBox();
        };

        self.unload = function () {

            unbindEvents();

            if (clockInterval) {
                clearInterval(clockInterval);
                clockInterval = null;
            }
        };

        function loadControlBox() {

            require(['apphost'], function (apphost) {
                updateWindowState(apphost.getWindowState());
            });
        }

        function bindEvents() {

            document.addEventListener('windowstatechanged', onWindowStateChanged);

            document.querySelector('.appExitButton').addEventListener('click', function () {
                Emby.App.exit();
            });

            document.querySelector('.minimizeButton').addEventListener('click', function () {
                require(['apphost'], function (apphost) {
                    apphost.setWindowState('Minimized');
                });
            });

            document.querySelector('.fullscreenExitButton').addEventListener('click', function () {
                require(['apphost'], function (apphost) {
                    apphost.setWindowState('Normal');
                });
            });

            document.addEventListener('usersignedin', onLocalUserSignedIn);
            document.addEventListener('usersignedout', onLocalUserSignedOut);
            document.addEventListener('viewshow', onViewShow);
        }

        function unbindEvents() {

            document.removeEventListener('windowstatechanged', onWindowStateChanged);
            document.removeEventListener('usersignedin', onLocalUserSignedIn);
            document.removeEventListener('usersignedout', onLocalUserSignedOut);
            document.removeEventListener('viewshow', onViewShow);
        }

        function onWindowStateChanged(e) {
            updateWindowState(e.detail.windowState);
        }

        function updateWindowState(windowState) {

            if (windowState == 'Maximized') {
                document.querySelector('.controlBox').classList.remove('hide');
            } else {
                document.querySelector('.controlBox').classList.add('hide');
            }
        }

        function onLocalUserSignedIn(e) {

            var user = e.detail.user;
            var apiClient = e.detail.apiClient;

            document.querySelector('.logo').classList.add('hide');

            document.querySelector('.searchButtonContainer').classList.remove('hide');

            var headerUserButton = document.querySelector('.headerUserButton');

            if (user.PrimaryImageTag) {

                headerUserButton.icon = null;
                headerUserButton.src = apiClient.getUserImageUrl(user.Id, {
                    tag: user.PrimaryImageTag,
                    type: 'Primary',
                    height: 44
                });

            } else {
                headerUserButton.src = null;
                headerUserButton.icon = 'person';
            }

            document.querySelector('.userButtonContainer').classList.remove('hide');
        }

        function onLocalUserSignedOut(e) {

            // Put the logo back in the page title
            document.querySelector('.logo').classList.remove('hide');

            document.querySelector('.searchButtonContainer').classList.add('hide');
            document.querySelector('.userButtonContainer').classList.add('hide');
        }

        function onViewShow(e) {

            if (Emby.Page.canGoBack()) {
                document.querySelector('.backButtonContainer').classList.remove('hide');
            } else {
                document.querySelector('.backButtonContainer').classList.add('hide');
            }
        }
    }

    Emby.PluginManager.register(new theme());

})();