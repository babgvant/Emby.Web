(function () {

    document.addEventListener("viewinit-defaulttheme-music", function (e) {

        new musicPage(e.detail.element, e.detail.params);
    });

    function musicPage(view, params) {

        var self = this;
        var itemPromise;

        view.addEventListener('viewshow', function (e) {

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self);
                }

                itemPromise = itemPromise || Emby.Models.item(params.parentid);

                itemPromise.then(function (item) {

                    Emby.Page.setTitle(item.Name);
                    Emby.Backdrop.setBackdrops([item]);
                });
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
        });
    }

    function renderTabs(view, initialTabId, pageInstance) {

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
            Name: Globalize.translate('Playlists'),
            Id: "playlists"
        },
        {
            Name: Globalize.translate('Genres'),
            Id: "genres"
        },
        {
            Name: Globalize.translate('Songs'),
            Id: "songs"
        }];

        var tabbedPage = new DefaultTheme.TabbedPage(view);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.renderTabs(tabs, initialTabId);
        pageInstance.tabbedPage = tabbedPage;
    }

    function loadViewContent(page, id, type) {

    }

})();