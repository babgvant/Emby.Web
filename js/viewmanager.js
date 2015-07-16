(function (globalScope, document) {

    function loadView(options) {

        var id = options.id;

        var pageContainer = document.querySelector('.pageContainer');

        if (pageContainer) {

            var div = document.createElement('div');
            div.classList.add('page-view');
            div.setAttribute('data-id', id);
            div.setAttribute('data-url', options.url);
            div.innerHTML = options.view;

            hideViews();

            pageContainer.appendChild(div);

            onViewChange(div);
        }
        else {
            alert('pageContainer is missing! The theme must render an element with className pageContainer');
        }
    }

    function getExistingViews() {
        return document.querySelectorAll('.pageContainer .page-view');
    }

    function tryRestoreView(url) {

        var views = getExistingViews();

        for (var i = 0, length = views.length; i < length; i++) {

            if (views[i].getAttribute('data-url') == url) {
                restoreView(views[i]);
                return true;
            }
        }

        return false;
    }

    function restoreView(view) {

        hideViews();
        view.style.display = 'block';
        onViewChange(view);
    }

    function hideViews() {

        var views = getExistingViews();

        for (var i = 0, length = views.length; i < length; i++) {
            views[i].style.display = 'none';
        }
    }

    function onViewChange(view) {

        // TODO: Is there a better way to determine that the view has loaded as opposed to a delay?
        setTimeout(function () {

            Emby.FocusManager.autoFocus(view);

            onShow(view);

        }, 500);
    }

    function onShow(view) {

        var myEvent = new CustomEvent("viewshow", {
            detail: {
                element: view,
                id: view.getAttribute('data-id')
            },
            bubbles: true,
            cancelable: false
        });

        document.dispatchEvent(myEvent);
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ViewManager = {
        loadView: loadView,
        tryRestoreView: tryRestoreView
    };

})(this, document);
