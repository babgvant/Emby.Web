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

            var packageName = typeof plugin === 'string' ? plugin : plugin.packageName;

            return '/' + 'plugins/' + packageName + '/' + path;

        };

        self.mapRequire = function (plugin, path) {

            if (typeof plugin === 'string') {
                plugin = plugins.filter(function (p) {
                    return p.packageName == plugin;
                })[0];
            }

            return plugin.baseUrl + '/' + path;
        };

        self.mapResource = function (plugin, path) {

            if (typeof plugin === 'string') {
                plugin = plugins.filter(function (p) {
                    return p.packageName == plugin;
                })[0];
            }

            return plugin.baseUrl + '/' + path;
        };
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PluginManager = new pluginManager();

})(this);