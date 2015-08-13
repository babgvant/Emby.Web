(function () {

    document.addEventListener("viewinit-defaulttheme-list", function (e) {

        new listPage(e.detail.element, e.detail.params);
    });

    function listPage(view, params) {

        var self = this;
        var itemPromise;

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
                        loadChildren(view, item, loading);
                        createHorizontalScroller(view.querySelector('.horizontalPageContent'), self);
                    }

                });
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
        });
    }

    function loadChildren(view, item, loading) {

        Emby.Models.children(item, {

            Limit: 500

        }).then(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: view.querySelector('.scrollSlider'),
                itemsContainer: view.querySelector('.scrollSlider'),
                shape: 'auto',
                rows: 2
            });

            loading.hide();
        });
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
                slyFrame.init();
                instance.slyFrame = slyFrame;
                initFocusHandler(view, slyFrame);

                setTimeout(function () {
                    var firstCard = view.querySelector('.card');
                    if (firstCard) {
                        slyFrame.toCenter(firstCard, true);
                        Emby.FocusManager.focus(firstCard);
                    }
                }, 400);
            });
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.addEventListener('focusin', function (e) {

            var focused = Emby.FocusManager.focusableParent(e.target);

            if (focused) {
                slyFrame.toCenter(focused, true);
            }
        });
    }

})();