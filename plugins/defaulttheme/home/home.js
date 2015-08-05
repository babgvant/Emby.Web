(function () {

    document.addEventListener("viewshow-defaulttheme-home", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;

        Emby.Backdrop.clear();

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            var apiClient = connectionManager.currentApiClient();

            renderUserViews(element, apiClient);
            createHorizontalScroller(element.querySelector('.homeBody'));
        });

        initEvents(element);
    });

    function renderUserViews(page, apiClient) {

        apiClient.getUserViews().then(function (result) {

            page.querySelector('.viewsScrollSlider').innerHTML = result.Items.map(function (i) {

                return '<paper-button class="flat btnUserViewHeader" data-id="' + i.Id + '" data-type="' + (i.CollectionType || '') + '"><h2>' + i.Name + '</h2></paper-button>';

            }).join('');

            createHeaderScroller(page);
        });

    }

    function createHeaderScroller(view) {

        require(['Sly', 'loading'], function (Sly, loading) {

            view = view.querySelector('.userViewNames');

            var scrollFrame = view.querySelector('.scrollFrame');

            scrollFrame.style.display = 'block';

            var options = {
                horizontal: 1,
                itemNav: 'basic',
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.scrollSlider'),
                itemSelector: '.btnUserViewHeader',
                activateOn: 'click focus',
                smart: true,
                easing: 'swing',
                releaseSwing: true,
                scrollBar: view.querySelector('.scrollbar'),
                scrollBy: 1,
                speed: 600,
                moveBy: 600,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            var frame = new Sly(scrollFrame, options).init();

            setTimeout(function () {

                loading.hide();
                Emby.FocusManager.focus(view.querySelector('.btnUserViewHeader'));

            }, 300);
        });
    }

    function initEvents(view) {

        // Catch events on the view headers
        var userViewNames = view.querySelector('.userViewNames');
        userViewNames.addEventListener('mousedown', function (e) {

            var elem = Emby.Dom.parentWithClass(e.target, 'btnUserViewHeader');

            if (elem) {
                elem.focus();
            }
        });

        userViewNames.addEventListener('focusin', function (e) {

            var elem = Emby.Dom.parentWithClass(e.target, 'btnUserViewHeader');

            if (elem) {
                setFocusDelay(view, elem);
            }
        });

        var homeScrollContent = view.querySelector('.homeScrollContent');

        // Catch events on items in the view
        homeScrollContent.addEventListener('mousedown', function (e) {

            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (card) {
                card.focus();
            }
        });

        // Catch events on items in the view
        homeScrollContent.addEventListener('click', function (e) {

            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (card && document.activeElement == card) {
                var id = card.getAttribute('data-id');

                if (id) {
                    Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'item/item.html') + '?id=' + id);
                }
            }
        });
    }

    var focusTimeout;
    function setFocusDelay(view, elem) {

        var viewId = elem.getAttribute('data-id');

        var btn = view.querySelector('.btnUserViewHeader.selected');

        if (btn) {

            if (viewId == btn.getAttribute('data-id')) {
                return;
            }
            btn.classList.remove('selected');
        }

        elem.classList.add('selected');

        if (focusTimeout) {
            clearTimeout(focusTimeout);
        }
        focusTimeout = setTimeout(function () {

            selectUserView(view, viewId);

        }, 300);
    }

    function selectUserView(page, id) {

        var btn = page.querySelector(".btnUserViewHeader[data-id='" + id + "']");

        loadViewContent(page, id, btn.getAttribute('data-type'));
    }

    function loadViewContent(page, id, type) {

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

                loadViewHtml(page, id, html, viewName);
            });
        });
    }

    function loadViewHtml(page, parentId, html, viewName) {

        if (bodySlyFrame) {
            bodySlyFrame.slideTo(0, true);
        }
        var homeScrollContent = page.querySelector('.homeScrollContent');

        html = '<div class="homePanel">' + html + '</div>';
        homeScrollContent.innerHTML = Globalize.translateHtml(html);

        var keyframes = [
                { opacity: '0', offset: 0 },
                { opacity: '1', offset: 1 }];
        var timing = { duration: 900, iterations: 1 };
        homeScrollContent.animate(keyframes, timing);
        require([Emby.PluginManager.mapRequire('defaulttheme', 'home/views.' + viewName)], function () {

            var homePanel = homeScrollContent.querySelector('.homePanel');
            new DefaultTheme[viewName + 'View'](homePanel, parentId);
        });
    }

    var bodySlyFrame;
    function createHorizontalScroller(view) {

        require(["Sly", 'loading'], function (Sly, loading) {

            var scrollFrame = view.querySelector('.scrollFrame');

            scrollFrame.style.display = 'block';

            var options = {
                horizontal: 1,
                itemNav: 0,
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.scrollSlider'),
                itemSelector: '.card',
                activateOn: 'click focus',
                smart: true,
                easing: 'swing',
                releaseSwing: true,
                scrollBar: view.querySelector('.scrollbar'),
                scrollBy: 40,
                speed: 600,
                moveBy: 600,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            bodySlyFrame = new Sly(scrollFrame, options).init();
            initFocusHandler(view, bodySlyFrame);
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.addEventListener('focusin', function (e) {

            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (card) {
                slyFrame.toCenter(card);
            }
        });
    }

})();