(function (globalScope) {

    function createHeaderScroller(view, initialTabId) {

        require(['slyScroller', 'loading'], function (slyScroller, loading) {

            view = view.querySelector('.userViewNames');

            var scrollFrame = view.querySelector('.scrollFrame');

            scrollFrame.style.display = 'block';

            var options = {
                horizontal: 1,
                itemNav: 'centered',
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.scrollSlider'),
                itemSelector: '.btnUserViewHeader',
                activateOn: 'focus',
                smart: true,
                easing: 'swing',
                releaseSwing: true,
                scrollBar: view.querySelector('.scrollbar'),
                scrollBy: 200,
                speed: 200,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                slyFrame.init();
                loading.hide();

                var initialTab = initialTabId ? view.querySelector('.btnUserViewHeader[data-id=\'' + initialTabId + '\']') : null;

                if (!initialTab) {
                    initialTab = view.querySelector('.btnUserViewHeader');
                }
                Emby.FocusManager.focus(initialTab);
            });
        });
    }

    function initEvents(view, instance) {

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
                instance.setFocusDelay(view, elem);
            }
        });
    }

    function selectUserView(page, id, self) {

        var btn = page.querySelector(".btnUserViewHeader[data-id='" + id + "']");

        self.bodySlyFrame.slideTo(0, true);

        self.loadViewContent(page, id, btn.getAttribute('data-type'));
    }

    function createHorizontalScroller(view, instance) {

        require(["slyScroller", 'loading'], function (slyScroller, loading) {

            var scrollFrame = view.querySelector('.scrollFrame');

            scrollFrame.style.display = 'block';

            var options = {
                horizontal: 1,
                itemNav: 0,
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.scrollSlider'),
                itemSelector: '.card',
                smart: true,
                easing: 'swing',
                releaseSwing: true,
                scrollBar: view.querySelector('.scrollbar'),
                scrollBy: 200,
                speed: 200,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                instance.bodySlyFrame = slyFrame;
                instance.bodySlyFrame.init();
                initFocusHandler(view, instance.bodySlyFrame);
            });
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.addEventListener('focusin', function (e) {

            var focused = Emby.FocusManager.focusableParent(e.target);

            if (focused) {
                slyFrame.toCenter(focused);

                zoomIn(focused);
            }
        });
        scrollSlider.addEventListener('focusout', function (e) {

            var focused = Emby.FocusManager.focusableParent(e.target);

            if (focused) {
                var elem = focused.querySelector('.focusedTransform');
                if (elem) {
                    elem.classList.remove('focusedTransform');
                }
            }
        });
    }

    function zoomIn(elem) {

        if (elem.classList.contains('noScale')) {
            return;
        }

        var keyframes = [
            { transform: 'scale(1)  ', offset: 0 },
          { transform: 'scale(1.12)', offset: 1 }
        ];

        var card = elem;
        elem = elem.tagName == 'PAPER-BUTTON' ? elem.querySelector('paper-material') : elem.querySelector('.cardBox');

        var timing = { duration: 200, iterations: 1 };
        elem.animate(keyframes, timing).onfinish = function () {
            if (document.activeElement == card) {
                elem.classList.add('focusedTransform');
            }
        };
    }

    function tabbedPage(page) {

        var self = this;

        self.renderTabs = function (tabs, initialTabId) {

            page.querySelector('.viewsScrollSlider').innerHTML = tabs.map(function (i) {

                return '<paper-button class="flat btnUserViewHeader" data-id="' + i.Id + '" data-type="' + (i.CollectionType || '') + '"><h2>' + i.Name + '</h2></paper-button>';

            }).join('');

            createHeaderScroller(page, initialTabId);
            initEvents(page, self);
            createHorizontalScroller(page.querySelector('.homeBody'), self);
        };

        var focusTimeout;
        self.setFocusDelay = function (view, elem) {

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

                selectUserView(view, viewId, self);

            }, 350);
        };

        self.destroy = function () {
        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.TabbedPage = tabbedPage;

})(this);