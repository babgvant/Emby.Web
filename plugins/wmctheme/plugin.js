define([], function () {

    return function () {

        var self = this;

        self.name = 'Windows Media Center Theme';
        self.type = 'theme';
        self.packageName = 'wmctheme';

        self.getHeaderTemplate = function () {
            return Emby.PluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var files = [
                'css!' + Emby.PluginManager.mapPath(self, 'css/style')
            ];

            return files;
        };

        self.getTranslations = function () {

            var files = [];

            return files;
        };

        self.getRoutes = function () {
            // Routes, relative to the current directory. The app will handle normalizing the full path

            var routes = [];

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'home.html'),
                id: 'wmctheme-home',
                type: 'home',
                transition: 'fade',
                dependencies: []
            });

            return routes;
        };

        self.load = function () {
        };

        self.unload = function () {
        };
    }
});