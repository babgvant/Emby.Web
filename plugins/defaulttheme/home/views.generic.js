(function (globalScope) {

    function view(element, id) {
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.genericView = view;

})(this);