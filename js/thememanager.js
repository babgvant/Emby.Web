(function (globalScope, document) {

    var currentTheme;
    function getCurrentTheme() {
        return currentTheme;
    }

    function loadTheme(packageName, callback) {

        var theme = PluginManager.plugins().filter(function (p) {
            return p.packageName == packageName;
        })[0];

        require(theme.getDependencies(), function () {

            var translations = theme.getTranslations ? theme.getTranslations() : [];

            Globalize.loadTranslations({

                name: 'theme',
                translations: translations

            }).then(function () {

                document.documentElement.className = theme.getOuterClassName();

                //document.querySelector('.themeContent').innerHTML = theme.getPageContent();
                currentTheme = theme;
                callback();
            });
        });
    }

    function loadUserTheme() {
        alert('user logged in, time to load theme!');
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ThemeManager = {
        getCurrentTheme: getCurrentTheme,
        loadTheme: loadTheme,
        loadUserTheme: loadUserTheme
    };

})(this, document);
