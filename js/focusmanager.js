(function (globalScope, document) {

    function autoFocus(view) {
        
        var element = view.querySelector('*[autofocus]');
        if (element) {
            focus(element);
        }
    }

    function focus(element) {

        if (element.tagName == 'PAPER-INPUT') {
            element = element.querySelector('input');
        }

        element.focus();
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.FocusManager = {
        autoFocus: autoFocus,
        focus: focus
    };

})(this, document);
