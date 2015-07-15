(function (globalScope, document) {

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.DefaultElements = {
        loading: {
            show: function () {

                var elem = document.querySelector('.docspinner');

                if (elem) {

                    elem.active = true;

                } else {

                    elem = document.createElement("paper-spinner");
                    elem.classList.add('docspinner');

                    document.body.appendChild(elem);
                    elem.active = true;
                }
            },

            hide: function () {

                var elem = document.querySelector('.docspinner');

                if (elem) {

                    elem.active = false;

                    setTimeout(function () {
                        elem.active = false;
                    }, 100);
                }
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

    require(['webcomponentsjs'], function () {

        require(['html!bower_components/paper-spinner/paper-spinner'], function () {


        });
    });

})(this, document);
