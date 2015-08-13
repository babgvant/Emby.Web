(function () {

    document.addEventListener("viewinit-defaulttheme-livetv", function (e) {

        new musicPage(e.detail.element, e.detail.params);
    });

    function musicPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self);
                }

                Emby.Page.setTitle(Globalize.translate('LiveTV'));
                Emby.Backdrop.clear();
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
            Name: Globalize.translate('Guide'),
            Id: "guide"
        },
        {
            Name: Globalize.translate('Channels'),
            Id: "channels"
        },
        {
            Name: Globalize.translate('Recordings'),
            Id: "recordings"
        },
        {
            Name: Globalize.translate('Scheduled'),
            Id: "scheduled"
        }];

        var tabbedPage = new DefaultTheme.TabbedPage(view);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.renderTabs(tabs, initialTabId);
        pageInstance.tabbedPage = tabbedPage;
    }

    function loadViewContent(page, id, type) {

    }

})();