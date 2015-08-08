define([], function () {

    function onViewChange(view) {

        // TODO: Is there a better way to determine that the view has loaded as opposed to a delay?
        setTimeout(function () {

            Emby.FocusManager.autoFocus(view);
            onShow(view);

        }, 500);
    }

    function onShow(view) {

        require(['bower_components/query-string/index'], function () {

            var params = queryString.parse(window.location.search);

            document.dispatchEvent(new CustomEvent("viewshow-" + view.getAttribute('data-id'), {
                detail: {
                    element: view,
                    id: view.getAttribute('data-id'),
                    params: params
                },
                bubbles: true,
                cancelable: false
            }));

            document.dispatchEvent(new CustomEvent("viewshow", {
                detail: {
                    element: view,
                    id: view.getAttribute('data-id'),
                    params: params
                },
                bubbles: true,
                cancelable: false
            }));
        });
    }

    function ViewManager() {

        var self = this;

        self.loadView = function (options) {
            require(['viewcontainer'], function (viewcontainer) {
                viewcontainer.loadView(options).then(onViewChange);
            });
        };

        self.tryRestoreView = function (url) {
            return new Promise(function (resolve, reject) {

                require(['viewcontainer'], function (viewcontainer) {
                    viewcontainer.tryRestoreView(url).then(resolve, reject);
                });
            });
        };
    }

    return new ViewManager();
});
