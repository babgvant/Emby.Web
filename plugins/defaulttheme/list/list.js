(function () {

    document.addEventListener("viewinit-defaulttheme-list", function (e) {

        new listPage(e.detail.element, e.detail.params);
    });

    function listPage(view, params) {

        var self = this;
        var itemPromise;
        var focusedElement;
        var currentAnimation;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            require(['loading'], function (loading) {

                if (!isRestored) {
                    loading.show();
                }

                Emby.Models.item(params.parentid).then(function (item) {

                    Emby.Page.setTitle(item.Name);
                    Emby.Backdrop.setBackdrops([item]);

                    if (!isRestored) {
                        createHorizontalScroller(view.querySelector('.horizontalPageContent'), self);
                        loadChildren(view, item, loading, self);
                    }

                });
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
        });


        function createHorizontalScroller(view) {

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
                    speed: 400,
                    elasticBounds: 1,
                    dragHandle: 1,
                    dynamicHandle: 1,
                    clickBar: 1
                };

                slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                    slyFrame.init();
                    self.slyFrame = slyFrame;
                    initFocusHandler(view, slyFrame);
                });
            });
        }

        var lastFocus = 0;
        function initFocusHandler(view, slyFrame) {

            var scrollSlider = view.querySelector('.scrollSlider');
            var selectedIndexElement = view.querySelector('.selectedIndex');

            scrollSlider.addEventListener('focusin', function (e) {

                var focused = Emby.FocusManager.focusableParent(e.target);
                focusedElement = focused;

                if (focused) {

                    var index = focused.getAttribute('data-index');
                    if (index && selectedIndexElement) {
                        selectedIndexElement.innerHTML = 1 + parseInt(index);
                    }

                    var now = new Date().getTime();
                    var animate = (now - lastFocus) > 100;
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

            if (elem.classList.contains('noScale')) {
                return;
            }

            var keyframes = [
                { transform: 'scale(1)  ', offset: 0 },
              { transform: 'scale(1.12)', offset: 1 }
            ];

            var card = elem;
            elem = elem.tagName == 'PAPER-BUTTON' ? elem.querySelector('.content') : elem.querySelector('.cardBox');

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
    }

    function loadChildren(view, item, loading, instance) {

        self.listController = new DefaultTheme.HorizontalList({

            itemsContainer: view.querySelector('.scrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.children(item, {
                    StartIndex: startIndex,
                    Limit: limit
                });
            },
            listCountElement: view.querySelector('.listCount'),
            listNumbersElement: view.querySelector('.listNumbers')
        });

        self.listController.render();
    }

})();