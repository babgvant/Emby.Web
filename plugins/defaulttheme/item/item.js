(function () {

    document.addEventListener("viewshow-defaulttheme-item", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;

        require(['loading'], function (loading) {

            loading.show();

            Emby.Models.item(params.id).then(function (item) {

                Emby.Backdrop.setBackdrops([item]);
                setHeaders(element, item);
            });
        });

        initEvents(element);
    });

    function setHeaders(view, item) {

        var headers = [];

        headers.push({
            name: Globalize.translate('Overview'),
            type: 'overview'
        });

        if (item.People && item.People.length) {
            headers.push({
                name: Globalize.translate('People'),
                type: 'people'
            });
        }

        if (item.SpecialFeatureCount > 0) {

            if (item.Type == 'Series') {
                headers.push({
                    name: Globalize.translate('Specials'),
                    type: 'specials'
                });
            } else {
                headers.push({
                    name: Globalize.translate('SpecialFeatures'),
                    type: 'specials'
                });
            }
        }

        view.querySelector('.scrollSlider').innerHTML = headers.map(function (i) {

            return '<paper-button class="flat btnUserViewHeader" data-type="' + i.type + '"><h2>' + i.name + '</h2></paper-button>';

        }).join('');

        createHeaderScroller(view);
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

        //loadViewContent(page, id, btn.getAttribute('data-type'));
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