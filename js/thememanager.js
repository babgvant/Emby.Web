(function (globalScope, document) {

    var currentTheme;
    function getCurrentTheme() {
        return currentTheme;
    }

    function loadTheme(packageName, callback) {

        var theme = Emby.PluginManager.plugins().filter(function (p) {
            return p.packageName == packageName;
        })[0];

        if (currentTheme) {
            unloadTheme(currentTheme);
        }

        var deps = theme.getDependencies().map(function(d) {
            return d.replace('css!', 'css!theme#');
        });

        require(deps, function () {

            var translations = theme.getTranslations ? theme.getTranslations() : [];

            Globalize.loadTranslations({

                name: 'theme',
                translations: translations

            }).then(function () {
                loadThemeHeader(theme, callback);
            });
        });
    }

    function unloadTheme(theme) {
        // Todo: unload css here
    }

    function loadThemeHeader(theme, callback) {

        getThemeHeader(theme).then(function (headerHtml) {

            document.querySelector('.mainHeader').innerHTML = headerHtml;

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

        var routes = currentTheme.getRoutes().filter(function (r) {
            return r.type == 'home';
        });

        if (!routes.length) {
            alert('theme has no home route defined!');
            return;
        }

        page.show(routes[0].path);
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
