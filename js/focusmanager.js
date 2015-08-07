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

    var focusableTagNames = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'PAPER-BUTTON', 'PAPER-INPUT', 'PAPER-TEXTAREA', 'PAPER-ICON-BUTTON'];

    function isFocusable(elem) {

        return focusableTagNames.indexOf(elem.tagName) != -1;
    }

    function focusableParent(elem) {

        while (!isFocusable(elem)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.FocusManager = {
        autoFocus: autoFocus,
        focus: focus,
        focusableParent: focusableParent
    };

})(this, document);
