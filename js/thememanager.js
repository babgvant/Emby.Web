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

            if (currentTheme.packageName == packageName) {
                // Nothing to do, it's already the active theme
                callback();
                return;
            }
            unloadTheme(currentTheme);
        }

        var deps = theme.getDependencies().map(function (d) {
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

        Emby.Backdrop.clear();

        Logger.log('Unloading theme: ' + theme.name);
        requireCss.unloadPackage('theme');

        document.dispatchEvent(new CustomEvent("themeunload", {
            detail: {
                name: theme.name
            }
        }));
    }

    function loadCss(theme, url) {

    }

    function unloadCss(theme, url) {

    }

    function loadThemeHeader(theme, callback) {

        getThemeHeader(theme).then(function (headerHtml) {

            document.querySelector('.mainHeader').innerHTML = headerHtml;

            //document.querySelector('.themeContent').innerHTML = theme.getPageContent();
            currentTheme = theme;
            theme.load();
            callback();
        });
    }

    function getThemeHeader(theme) {

        return new Promise(function (resolve, reject) {

            if (!theme.getHeaderTemplate) {
                resolve('');
                return;
            }

            require(['httpclient'], function (httpclient) {
                httpclient.request({

                    url: theme.getHeaderTemplate(),
                    type: 'GET',
                    dataType: 'html'

                }).then(function (html) {
                    resolve(html);

                }, function () {
                    resolve('');
                });
            });
        });
    }

    function loadUserTheme() {

        var userTheme = Emby.PluginManager.ofType('theme')[0];

        loadTheme('defaulttheme', function () {
            userTheme.goHome();
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ThemeManager = {
        getCurrentTheme: getCurrentTheme,
        loadTheme: loadTheme,
        loadUserTheme: loadUserTheme,
        loadCss: loadCss,
        unloadCss: unloadCss
    };

})(this, document);
