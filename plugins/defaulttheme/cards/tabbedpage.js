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

        self.loadViewContent.call(self, page, id, btn.getAttribute('data-type'));
    }

    function tabbedPage(page, pageOptions) {

        var self = this;
        pageOptions = pageOptions || {};
        var focusedElement;
        var currentAnimation;
        var selectedMediaInfo = page.querySelector('.selectedMediaInfo');

        var tagName = Emby.Dom.supportsWebComponents() ? 'paper-button' : 'button';

        self.renderTabs = function (tabs, initialTabId) {

            page.querySelector('.viewsScrollSlider').innerHTML = tabs.map(function (i) {

                return '<' + tagName + ' class="flat btnUserViewHeader" data-id="' + i.Id + '" data-type="' + (i.CollectionType || '') + '"><h2>' + i.Name + '</h2></' + tagName + '>';

            }).join('');

            createHeaderScroller(page, initialTabId);
            initEvents(page, self);
            createHorizontalScroller(page);
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

            }, 500);
        };

        function createHorizontalScroller(view) {

            require(["slyScroller", 'loading'], function (slyScroller, loading) {

                var scrollFrame = view.querySelector('.itemScrollFrame');

                scrollFrame.style.display = 'block';

                var options = {
                    horizontal: 1,
                    itemNav: 0,
                    mouseDragging: 1,
                    touchDragging: 1,
                    slidee: view.querySelector('.contentScrollSlider'),
                    itemSelector: '.card',
                    smart: true,
                    easing: 'swing',
                    releaseSwing: true,
                    scrollBar: view.querySelector('.contentScrollbar'),
                    scrollBy: 200,
                    speed: 500,
                    elasticBounds: 1,
                    dragHandle: 1,
                    dynamicHandle: 1,
                    clickBar: 1
                };

                slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                    self.bodySlyFrame = slyFrame;
                    self.bodySlyFrame.init();
                    initFocusHandler(view, self.bodySlyFrame, self);
                });
            });
        }

        var lastFocus = 0;
        function initFocusHandler(view, slyFrame) {

            var selectedIndexElement = view.querySelector('.selectedIndex');

            var scrollSlider = view.querySelector('.contentScrollSlider');
            scrollSlider.addEventListener('focusin', function (e) {

                var focused = Emby.FocusManager.focusableParent(e.target);
                focusedElement = focused;

                if (focused) {

                    if (selectedIndexElement) {
                        var index = focused.getAttribute('data-index');
                        if (index) {
                            selectedIndexElement.innerHTML = 1 + parseInt(index);
                        }
                    }

                    var now = new Date().getTime();

                    var animate = pageOptions.animateFocus || (now - lastFocus) > 100;

                    slyFrame.toCenter(focused, !animate);
                    lastFocus = now;
                    startZoomTimer();
                }
            });
            scrollSlider.addEventListener('focusout', function (e) {

                var focused = focusedElement;
                focusedElement = null;

                if (focused) {
                    var elem = focused.querySelector('.focusedTransform');
                    if (elem) {
                        elem.classList.remove('focusedTransform');
                    }
                }

                if (currentAnimation) {
                    currentAnimation.cancel();
                    currentAnimation = null;
                }
            });
        }

        var zoomTimeout;
        function startZoomTimer() {

            if (onZoomTimeout) {
                clearTimeout(zoomTimeout);
            }
            zoomTimeout = setTimeout(onZoomTimeout, 50);
        }

        function onZoomTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                zoomIn(focused);
            }
        }

        function zoomIn(elem) {

            setTimeout(function() {
                fillMediaInfo(elem);
            }, 100);

            if (elem.classList.contains('noScale')) {
                return;
            }

            var keyframes = [
                { transform: 'scale(1)  ', offset: 0 },
              { transform: 'scale(1.12)', offset: 1 }
            ];

            var card = elem;
            elem = elem.tagName == 'PAPER-BUTTON' ? elem.querySelector('paper-material') : elem.querySelector('.cardBox');

            var onAnimationFinished = function () {
                if (document.activeElement == card) {
                    elem.classList.add('focusedTransform');
                }
                currentAnimation = null;
            };

            if (elem.animate) {
                var timing = { duration: 200, iterations: 1 };
                var animation = elem.animate(keyframes, timing);

                animation.onfinish = onAnimationFinished;
                currentAnimation = animation;
            } else {
                onAnimationFinished();
            }
        }

        function fillMediaInfo(elem) {

        }

        self.destroy = function () {
            if (self.bodySlyFrame) {
                self.bodySlyFrame.destroy();
                self.bodySlyFrame = null
            }
        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.TabbedPage = tabbedPage;

})(this);