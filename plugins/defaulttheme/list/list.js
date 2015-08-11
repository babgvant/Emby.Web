(function () {

    document.addEventListener("viewshow-defaulttheme-list", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        require(['loading'], function (loading) {

            if (!isRestored) {
                loading.show();
            }

            Emby.Models.item(params.parentid).then(function (item) {

                Emby.Backdrop.setBackdrops([item]);

                if (!isRestored) {
                    loadChildren(element, item, loading);
                    createHorizontalScroller(element.querySelector('.horizontalPageContent'));
                }

            });
        });
    });

    function loadChildren(view, item, loading) {

        Emby.Models.children(item).then(function(result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: view.querySelector('.scrollSlider'),
                itemsContainer: view.querySelector('.scrollSlider'),
                shape: 'auto',
                rows: 2
            });

            loading.hide();
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

            var slyFrame = new Sly(scrollFrame, options);
            slyFrame.init();

            initFocusHandler(view, slyFrame);

            setTimeout(function() {
                var firstCard = view.querySelector('.card');
                if (firstCard) {
                    Emby.FocusManager.focus(firstCard);
                }
            }, 500);
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.addEventListener('focusin', function (e) {

            var focused = Emby.FocusManager.focusableParent(e.target);

            if (focused) {
                slyFrame.toCenter(focused);
            }
        });
    }

})();