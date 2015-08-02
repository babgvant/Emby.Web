(function (globalScope, document) {

    function loadView(options) {

        require(['viewcontainer'], function (viewcontainer) {
            viewcontainer.loadView(options).then(onViewChange);
        });
    }

    function tryRestoreView(url) {

        return false;
    }

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

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ViewManager = {
        loadView: loadView,
        tryRestoreView: tryRestoreView
    };

})(this, document);
