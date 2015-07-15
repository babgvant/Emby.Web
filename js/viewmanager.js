(function (globalScope, document) {

    function loadView(view) {

        var contentElement = document.querySelector('.pageContainer');

        if (contentElement) {
            contentElement.innerHTML = view;

            onViewChange(contentElement);
        }
        else {
            alert('pageContainer is missing! The theme must render an element with className pageContainer');
        }
    }

    function onViewChange(contentElement) {

        // TODO: Is there a better way to determine that the view has loaded as opposed to a delay?
        setTimeout(function () {

            var autoFocus = contentElement.querySelector('*[autofocus]');
            if (autoFocus) {
                autoFocus.focus();
            }

            var view = contentElement.querySelector('.view');

            if (view) {

                onShow(view);
            }

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
        loadView: loadView
    };

})(this, document);
