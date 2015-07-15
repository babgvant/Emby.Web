(function (globalScope, document) {

    function loadView(view) {

        var contentElement = document.querySelector('.pageContainer');

        if (contentElement) {
            contentElement.innerHTML = view;

            var view = contentElement.querySelector('.view');

            if (view) {

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
        }
        else {
            alert('pageContainer is missing! The theme must render an element with className pageContainer');
        }
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ViewManager = {
        loadView: loadView
    };

})(this, document);
