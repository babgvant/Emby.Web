(function () {

    document.addEventListener("viewshow-defaulttheme-tv", function (e) {

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
                    renderTabs(element, params.tab);
                }
            });
        });

    });

    function renderTabs(page, initialTabId) {

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

        var tabbedPage = new DefaultTheme.TabbedPage(page);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.renderTabs(tabs, initialTabId);
    }

    function loadViewContent(page, id, type) {

    }

})();