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
            return Emby.PluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var files = [
                Emby.PluginManager.mapPath(self, 'js/header'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/style'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/card'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/colors.dark'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/paperstyles'),
                'html!bower_components/iron-icon/iron-icon.html',
                'html!bower_components/iron-iconset-svg/iron-iconset-svg.html',
                'html!' + Emby.PluginManager.mapPath(self, 'icons.html'),
                'html!bower_components/paper-button/paper-button.html',
                'html!bower_components/paper-icon-button/paper-icon-button.html',
                'html!bower_components/paper-input/paper-input.html',
                'html!bower_components/iron-list/iron-list.html',
                'html!bower_components/paper-material/paper-material.html',
                'html!bower_components/iron-form/iron-form.html'
            ];

            return files;
        };

        self.getTranslations = function () {

            var files = [];

            files.push({
                lang: 'en-us',
                path: Emby.PluginManager.mapPath(self, 'strings/en-us.json')
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
                dependencies: []
            });

            return routes;
        };

        var clockInterval;
        self.load = function () {
            updateClock();
            setInterval(updateClock, 50000);
        };

        self.unload = function () {

            if (clockInterval) {
                clearInterval(clockInterval);
                clockInterval = null;
            }
        };
    }

    Emby.PluginManager.register(new theme());

})();