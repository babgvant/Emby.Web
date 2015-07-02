(function () {

    function getRoutes() {

        // Routes, relative to the current directory. The app will handle normalizing the full path

        var routes = [];

        return routes;
    }

    function getPageContent() {

        var html = '';

        html += '<div class="pageContainer"></div>';

        return html;
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
        self.getPageContent = getPageContent;
        self.getOuterClassName = getOuterClassName;

        self.getDependencies = function () {

            var files = [
                'css!' + PluginManager.mapPath(self, 'css/style')
            ];

            return files;
        };
    }

    PluginManager.register(new theme());

})();