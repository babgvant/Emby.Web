(function (globalScope, document) {

    function loadView(view) {

        var contentElement = document.querySelector('.pageContainer');

        if (contentElement) {
            contentElement.innerHTML = view;
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
