(function () {

    document.addEventListener("viewinit-defaulttheme-nowplayingplaylist", function (e) {

        new playlistPage(e.detail.element, e.detail.params);
    });

    function playlistPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

        });

        view.addEventListener('viewdestroy', function () {

        });
    }

})();