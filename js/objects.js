(function (globalScope) {

    function pluginManager() {

        var self = this;
        var plugins = [];

        // In lieu of automatic discovery, plugins will register dynamic objects
        // Each object will have the following properties:
        // name
        // type (theme, screensaver, etc)
        self.register = function (obj) {

            plugins.push(obj);
        };

        self.ofType = function (type) {

            return plugins.filter(function (o) {
                return o.type == type;
            });
        };

        self.plugins = function () {
            return plugins;
        };

        self.mapPath = function (plugin, path) {

            return 'plugins/' + plugin.packageName + '/' + path;

        }
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PluginManager = new pluginManager();

})(this);