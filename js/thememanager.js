(function (globalScope, document) {

    var currentTheme;
    function getCurrentTheme() {
        return currentTheme;
    }

    function loadTheme(packageName, callback) {

        var theme = Emby.PluginManager.plugins().filter(function (p) {
            return p.packageName == packageName;
        })[0];

        require(theme.getDependencies(), function () {

            var translations = theme.getTranslations ? theme.getTranslations() : [];

            Globalize.loadTranslations({

                name: 'theme',
                translations: translations

            }).then(function () {
                loadThemeHeader(theme, callback);
            });
        });
    }

    function loadThemeHeader(theme, callback) {

        getThemeHeader(theme).then(function (headerHtml) {

            document.querySelector('.header').innerHTML = headerHtml;

            document.documentElement.className = theme.getOuterClassName();

            //document.querySelector('.themeContent').innerHTML = theme.getPageContent();
            currentTheme = theme;
            theme.load();
            callback();
        });
    }

    function getThemeHeader(theme) {

        return new Promise(function (resolve, reject) {

            if (!theme.getAnonymousHeaderTemplate) {
                resolve('');
                return;
            }

            HttpClient.send({

                url: theme.getAnonymousHeaderTemplate(),
                type: 'GET',
                dataType: 'html'

            }).done(function (html) {
                resolve(html);

            }).fail(function () {
                resolve('');
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
