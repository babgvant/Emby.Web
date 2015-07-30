(function () {

    document.addEventListener("viewshow-defaulttheme-home", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;

        require(['connectionManager'], function (connectionManager) {
            var apiClient = connectionManager.currentApiClient();

            renderUserViews(element, apiClient);
            createHorizontalScroller(element);
        });
    });

    function renderUserViews(page, apiClient) {

        apiClient.getUserViews().then(function (result) {

            page.querySelector('.userViewsHeaderTemplate').items = result.Items;
        });
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

        view.addEventListener('mousedown', function (e) {

            var card = findParent(e.target, 'card');

            if (card) {
                card.focus();
            }
        });

        view.addEventListener('focusin', function (e) {

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