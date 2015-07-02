(function () {

    function getRoutes() {

        // Routes, relative to the current directory. The app will handle normalizing the full path

        var routes = [];

        return routes;
    }

    function theme() {

        var self = this;

        self.name = 'Default Theme';
        self.type = 'theme';
        self.packageName = 'defaulttheme';
        self.bodyClassName = 'defaultTheme';
        self.getRoutes = getRoutes;

        self.getDependencies = function () {

            var files = [
                'css!' + PluginManager.mapPath(self, 'css/style')
            ];

            return files;
        };
    }

    PluginManager.register(new theme());

})();