(function () {

    document.addEventListener("viewshow-defaulttheme-home", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        Emby.Page.setTitle(null);

        if (!isRestored) {
            Emby.Backdrop.clear();

            require(['loading'], function (loading) {

                loading.show();

                renderUserViews(element);
            });
        }
    });

    function renderUserViews(page) {

        Emby.Models.userViews().then(function (result) {

            var tabbedPage = new DefaultTheme.TabbedPage(page);
            tabbedPage.loadViewContent = loadViewContent;
            tabbedPage.renderTabs(result.Items);
        });
    }

    function loadViewContent(page, slyFrame, id, type) {

        type = (type || '').toLowerCase();

        var viewName = '';

        switch (type) {
            case 'tvshows':
                viewName = 'tv';
                break;
            case 'movies':
                viewName = 'movies';
                break;
            case 'channels':
                viewName = 'channels';
                break;
            case 'music':
                viewName = 'music';
                break;
            case 'playlists':
                viewName = 'playlists';
                break;
            case 'livetv':
                viewName = 'livetv';
                break;
            default:
                viewName = 'generic';
                break;
        }

        require(['httpclient'], function (httpclient) {
            httpclient.request({

                url: Emby.PluginManager.mapResource('defaulttheme', 'home/views.' + viewName + '.html'),
                type: 'GET',
                dataType: 'html'

            }).then(function (html) {

                loadViewHtml(page, slyFrame, id, html, viewName);
            });
        });
    }

    function loadViewHtml(page, slyFrame, parentId, html, viewName) {

        slyFrame.slideTo(0, true);
        var homeScrollContent = page.querySelector('.scrollContent');

        html = '<div class="homePanel">' + html + '</div>';
        homeScrollContent.innerHTML = Globalize.translateHtml(html);

        var keyframes = [
                { opacity: '0', offset: 0 },
                { opacity: '1', offset: 1 }];
        var timing = { duration: 900, iterations: 1 };
        homeScrollContent.animate(keyframes, timing);
        require([Emby.PluginManager.mapRequire('defaulttheme', 'home/views.' + viewName + '.js')], function () {

            var homePanel = homeScrollContent.querySelector('.homePanel');
            new DefaultTheme[viewName + 'View'](homePanel, parentId);
        });
    }

})();