(function () {

    function getRoutes() {

        // Routes, relative to the current directory. The app will handle normalizing the full path

        var routes = [];

        return routes;
    }

    function getDependencies() {

        // css and js, relative to the current directory. The app will handle normalizing the full path

        var files = [];

        return files;
    }

    function theme() {

        var self = this;

        self.name = 'Default Theme';
        self.type = 'theme';
        self.packageName = 'defaulttheme';
        self.getRoutes = getRoutes;
        self.getDependencies = getDependencies;

        ObjectManager.register(self);
    }

})();