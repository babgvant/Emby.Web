(function () {

    document.addEventListener("viewshow-defaulttheme-item", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;

        require(['loading'], function (loading) {

            loading.show();

            Emby.Models.item(params.id).then(function (item) {

                Emby.Backdrop.setBackdrops([item]);
            });
        });

        initEvents(element);
    });

    document.addEventListener("viewhide-defaulttheme-item", function (e) {

        Emby.Backdrop.clear();
    });

    function initEvents(view) {

        // Catch events on the view headers
        var userViewNames = view.querySelector('.userViewNames');
        userViewNames.addEventListener('mousedown', function (e) {

            var elem = findParent(e.target, 'btnUserViewHeader');

            if (elem) {
                elem.focus();
            }
        });

        userViewNames.addEventListener('focusin', function (e) {

            var elem = findParent(e.target, 'btnUserViewHeader');

            if (elem) {
                setFocusDelay(view, elem);
            }
        });
    }

})();