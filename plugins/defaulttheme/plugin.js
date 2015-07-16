(function () {

    function getRoutes() {

        // Routes, relative to the current directory. The app will handle normalizing the full path

        var routes = [];

        return routes;
    }

    function getOuterClassName() {

        var name = 'defaultTheme';

        name += ' dark';

        return name;
    }

    function theme() {

        var self = this;

        self.name = 'Default Theme';
        self.type = 'theme';
        self.packageName = 'defaulttheme';
        self.getRoutes = getRoutes;
        self.getOuterClassName = getOuterClassName;

        self.getDependencies = function () {

            var files = [
                'css!' + PluginManager.mapPath(self, 'css/style'),
                'css!' + PluginManager.mapPath(self, 'css/colors.dark'),
                'css!' + PluginManager.mapPath(self, 'css/paperstyles'),
                'webcomponentsjs',
                'html!bower_components/iron-icon/iron-icon.html',
                'html!bower_components/iron-iconset-svg/iron-iconset-svg.html',
                'html!' + PluginManager.mapPath(self, 'icons.html'),
                'html!bower_components/paper-button/paper-button.html',
                'html!bower_components/paper-input/paper-input.html',
                'html!bower_components/paper-material/paper-material.html',
                'html!bower_components/neon-animation/neon-animated-pages.html',
            'html!bower_components/neon-animation/animations/slide-from-left-animation.html',
            'html!bower_components/neon-animation/animations/slide-from-right-animation.html',
            'html!bower_components/neon-animation/animations/slide-left-animation.html',
            'html!bower_components/neon-animation/animations/slide-right-animation.html'
            ];

            return files;
        };

        self.getTranslations = function () {

            var files = [];

            files.push({
                lang: 'en-us',
                path: PluginManager.mapPath(self, 'strings/en-us.json')
            });

            return files;
        };
    }

    PluginManager.register(new theme());

})();