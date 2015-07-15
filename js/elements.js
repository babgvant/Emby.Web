(function (globalScope, document) {

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    function getTheme() {
        return Emby.ThemeManager.getCurrentTheme();
    }

    globalScope.Emby.elements = {
        loading: {
            show: function () {

                var theme = getTheme();
                if (theme.showLoading) {
                    theme.showLoading();
                } else {
                    Emby.DefaultElements.loading.show();
                }
            },

            hide: function () {

                var theme = getTheme();
                if (theme.hideLoading) {
                    theme.hideLoading();
                } else {
                    Emby.DefaultElements.loading.hide();
                }
            }
        },

        alert: function (options) {

            var theme = getTheme();
            if (theme.alert) {
                theme.alert(options);
            } else {
                Emby.DefaultElements.alert(options);
            }
        },

        confirm: function (options) {

            var theme = getTheme();
            if (theme.confirm) {
                theme.confirm(options);
            } else {
                Emby.DefaultElements.confirm(options);
            }
        },

        toast: function (options) {

            var theme = getTheme();
            if (theme.toast) {
                theme.toast(options);
            } else {
                Emby.DefaultElements.toast(options);
            }
        }
    };

})(this, document);
