(function () {

    document.addEventListener("viewinit-defaulttheme-search", function (e) {

        new searchPage(e.detail.element, e.detail.params);
    });

    function searchPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle(Globalize.translate('Search'));
        });

        view.addEventListener('viewdestroy', function () {

        });
    }

})();