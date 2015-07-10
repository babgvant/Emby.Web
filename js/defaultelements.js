(function (globalScope, document) {

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.DefaultElements = {
        loading: {
            show: function () {

            },

            hide: function () {

            }
        },

        alert: function (options) {

            alert(options.text);

            if (options.callback) {
                options.callback();
            }
        },

        confirm: function (options) {

            var result = confirm(options.text);

            if (options.callback) {
                options.callback(result);
            }
        },

        toast: function (options) {

            alert(options.text);
        }
    };

})(this, document);
