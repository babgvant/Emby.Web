(function () {

    document.addEventListener("viewshow-defaulttheme-home", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            var apiClient = connectionManager.currentApiClient();

            renderUserViews(element, apiClient);
        });

        initEvents(element);
    });

    function renderUserViews(page, apiClient) {

        apiClient.getUserViews().then(function (result) {

            page.querySelector('.userViewsHeaderTemplate').items = result.Items;

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

            setTimeout(function () {

                var frame = new Sly(scrollFrame, options).init();

                setTimeout(function () {

                    loading.hide();
                    Emby.FocusManager.focus(view.querySelector('.btnUserViewHeader'));

                }, 700);

            }, 500);
        });
    }

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

        // Catch events on items in the view
        view.querySelector('.homeBody').addEventListener('mousedown', function (e) {

            var card = findParent(e.target, 'card');

            if (card) {
                card.focus();
            }
        });
    }

    var focusTimeout;
    function setFocusDelay(view, elem) {

        var btn = view.querySelector('.btnUserViewHeader.selected');

        if (btn) {
            btn.classList.remove('selected');
        }

        elem.classList.add('selected');

        if (focusTimeout) {
            clearTimeout(focusTimeout);
        }
        focusTimeout = setTimeout(function () {

            selectUserView(view, elem.getAttribute('data-id'));

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

        var homeAnimatedPages = page.querySelector('.homeAnimatedPages');

        homeAnimatedPages.entryAnimation = 'fade-in-animation';
        homeAnimatedPages.exitAnimation = 'fade-out-animation';

        var newIndex = homeAnimatedPages.selected === 0 ? 1 : 0;

        var animatedPage = page.querySelector('.scrollerPage' + newIndex);
        animatedPage.innerHTML = Globalize.translateHtml(html);

        require([Emby.PluginManager.mapRequire('defaulttheme', 'home/views.' + viewName)], function () {

            new DefaultTheme[viewName + 'View'](animatedPage, parentId);
            homeAnimatedPages.cancelAnimation();
            homeAnimatedPages.selected = newIndex;
            createHorizontalScroller(animatedPage);
        });
    }

    var currentSlyFrame;
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
                scrollBy: 1,
                speed: 600,
                moveBy: 600,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            if (currentSlyFrame) {
                currentSlyFrame.destroy();
            }

            currentSlyFrame = new Sly(scrollFrame, options).init();
            initFocusHandler(view, currentSlyFrame);
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.addEventListener('focusin', function (e) {

            var card = findParent(e.target, 'card');

            if (card) {
                slyFrame.toCenter(card);
            }
        });
    }

    function findParent(elem, className) {

        while (!elem.classList || !elem.classList.contains(className)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

})();