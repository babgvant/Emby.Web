(function () {

    document.addEventListener("viewshow-defaulttheme-music", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        require(['loading'], function (loading) {

            if (!isRestored) {
                loading.show();
            }

            Emby.Models.item(params.parentid).then(function (item) {

                Emby.Page.setTitle(item.Name);
                Emby.Backdrop.setBackdrops([item]);

                if (!isRestored) {
                    renderTabs(element);
                }
            });
        });

    });

    function renderTabs(page) {

        var tabs = [
        {
            Name: Globalize.translate('Albums'),
            Id: "albums"
        },
        {
            Name: Globalize.translate('AlbumArtists'),
            Id: "albumartists"
        },
        {
            Name: Globalize.translate('Artists'),
            Id: "artists"
        },
        {
            Name: Globalize.translate('Genres'),
            Id: "genres"
        },
        {
            Name: Globalize.translate('Songs'),
            Id: "songs"
        },
        {
            Name: Globalize.translate('Playlists'),
            Id: "playlists"
        }];

        var tabbedPage = new DefaultTheme.TabbedPage(page);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.renderTabs(tabs);
    }

    function loadViewContent(page, id, type) {

    }

})();