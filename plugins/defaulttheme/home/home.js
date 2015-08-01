(function () {

    document.addEventListener("viewshow-defaulttheme-home", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;

        require(['connectionManager'], function (connectionManager) {
            var apiClient = connectionManager.currentApiClient();

            renderUserViews(element, apiClient);
        });

        initEvents(element);
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

        // Catch events on items in the view
        view.querySelector('.homeBody').addEventListener('mousedown', function (e) {

            var card = findParent(e.target, 'card');

            if (card) {
                card.focus();
            }
        });
    }

    function setFocusDelay(view, elem) {

        var btn = view.querySelector('.btnUserViewHeader.selected');

        if (btn) {
            btn.classList.remove('selected');
        }

        elem.classList.add('selected');

        setTimeout(function () {

            if (document.activeElement == elem) {
                selectUserView(view, elem.getAttribute('data-id'));
            }

        }, 300);
    }

    function renderUserViews(page, apiClient) {

        apiClient.getUserViews().then(function (result) {

            page.querySelector('.userViewsHeaderTemplate').items = result.Items;

            setTimeout(function () {
                Emby.FocusManager.focus(page.querySelector('.btnUserViewHeader'));

            }, 500);
        });

    }

    function selectUserView(page, id) {

        var btn = page.querySelector(".btnUserViewHeader[data-id='" + id + "']");

        loadViewContent(page, id, btn.getAttribute('data-type'));
    }

    function loadViewContent(page, id, type) {

        HttpClient.request({

            url: 'home/generic.html',
            type: 'GET',
            dataType: 'html'

        }).then(function (html) {

            loadViewHtml(page, html);
        });
    }

    function loadViewHtml(page, html) {

        var homeAnimatedPages = page.querySelector('.homeAnimatedPages');

        homeAnimatedPages.entryAnimation = 'slide-from-right-animation';
        homeAnimatedPages.exitAnimation = 'slide-left-animation';

        var selected = homeAnimatedPages.selected;

        var newIndex = selected ? 0 : 1;

        var animatedPage = page.querySelector('.scrollerPage' + newIndex);
        animatedPage.innerHTML = html;
        createHorizontalScroller(animatedPage);
        homeAnimatedPages.selected = newIndex;
    }

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
            var frame = new Sly(scrollFrame, options).init();

            initFocusHandler(view, frame);
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