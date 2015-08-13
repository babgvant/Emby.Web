(function () {

    document.addEventListener("viewinit-defaulttheme-tv", function (e) {

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
            Name: Globalize.translate('Suggested'),
            Id: "suggested"
        },
        {
            Name: Globalize.translate('Latest'),
            Id: "latest"
        },
        {
            Name: Globalize.translate('Series'),
            Id: "series"
        },
        {
            Name: Globalize.translate('Upcoming'),
            Id: "upcoming"
        },
        {
            Name: Globalize.translate('Genres'),
            Id: "genres"
        }];

        var tabbedPage = new DefaultTheme.TabbedPage(view);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.renderTabs(tabs, initialTabId);
        pageInstance.tabbedPage = tabbedPage;
    }

    function loadViewContent(page, id, type) {

    }

})();