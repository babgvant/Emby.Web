define([], function () {

    var currentView;

    function onViewChange(view, url, isRestore) {

        currentView = view;

        // TODO: Is there a better way to determine that the view has loaded as opposed to a delay?
        setTimeout(function () {

            if (!isRestore) {
                Emby.FocusManager.autoFocus(view);
            }
            else if (view.activeElement) {
                view.activeElement.focus();
            }

            onShow(view, url, isRestore);

        }, 500);
    }

    function onShow(view, url, isRestore) {

        require(['bower_components/query-string/index'], function () {

            var index = url.indexOf('?');
            var params = index == -1 ? {} : queryString.parse(url.substring(index + 1));

            var eventDetail = {
                detail: {
                    element: view,
                    id: view.getAttribute('data-id'),
                    params: params,
                    isRestored: isRestore
                },
                bubbles: true,
                cancelable: false
            };

            document.dispatchEvent(new CustomEvent("viewshow-" + view.getAttribute('data-id'), eventDetail));
            document.dispatchEvent(new CustomEvent("viewshow", eventDetail));

        });
    }

    function resetCachedViews() {
        // Reset all cached views whenever the theme changes
        require(['viewcontainer'], function (viewcontainer) {
            viewcontainer.reset();
        });
    }

    document.addEventListener('themeunload', resetCachedViews);
    document.addEventListener('usersignedin', resetCachedViews);
    document.addEventListener('usersignedout', resetCachedViews);

    function tryRestoreInternal(viewcontainer, options, resolve, reject) {

        viewcontainer.tryRestoreView(options).then(function (view) {

            onViewChange(view, options.url, true);
            resolve();

        }, reject);
    }

    function ViewManager() {

        var self = this;

        self.loadView = function (options) {

            // Record the element that has focus
            if (currentView) {
                currentView.activeElement = document.activeElement;
            }

            require(['viewcontainer'], function (viewcontainer) {
                viewcontainer.loadView(options).then(function (view) {
                    onViewChange(view, options.url);
                });
            });
        };

        self.tryRestoreView = function (options) {
            return new Promise(function (resolve, reject) {

                // Record the element that has focus
                if (currentView) {
                    currentView.activeElement = document.activeElement;
                }

                require(['viewcontainer'], function (viewcontainer) {

                    tryRestoreInternal(viewcontainer, options, resolve, reject);
                });
            });
        };
    }

    return new ViewManager();
});
