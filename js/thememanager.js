(function (globalScope, document) {

    function getCurrentTheme() {

    }

    function loadTheme(packageName, callback) {

        var theme = PluginManager.plugins().filter(function (p) {
            return p.packageName == packageName;
        })[0];

        require(theme.getDependencies(), function () {

            document.documentElement.className = theme.getOuterClassName();

            document.querySelector('.themeContent').innerHTML = theme.getPageContent();

            callback();
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ThemeManager = {
        getCurrentTheme: getCurrentTheme,
        loadTheme: loadTheme
    };

})(this, document);
