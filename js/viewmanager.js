(function (globalScope, document) {

    function loadView(options) {

        var animatedPages = document.querySelector('.mainAnimatedPages');
        loadViewInternal(animatedPages, options);
    }

    function loadViewInternal(animatedPages, options) {

        setAnimationStyle(animatedPages, 'slide', false);

        var html = '<div class="page-view" data-id="' + options.id + '" data-url="' + options.url + '">';
        html += options.view;
        html += '</div>';

        var pageIndex = animatedPages.selected === 0 ? 1 : 0;
        var animatable = animatedPages.querySelectorAll('neon-animatable')[pageIndex];

        animatable.innerHTML = html;

        setTimeout(function () {
            animatedPages.selected = pageIndex;
            onViewChange(animatable.querySelector('.page-view'));

        }, 400);
    }

    function setAnimationStyle(animatedPages, transition, isBack) {

        if (transition == 'slide') {

            if (isBack) {
                animatedPages.entryAnimation = 'slide-from-left-animation';
                animatedPages.exitAnimation = 'slide-right-animation';
            } else {
                animatedPages.entryAnimation = 'slide-from-right-animation';
                animatedPages.exitAnimation = 'slide-left-animation';
            }
        }
    }

    function getExistingViews() {
        return document.querySelectorAll('.pageContainer .page-view');
    }

    function tryRestoreView(url) {

        var views = getExistingViews();

        for (var i = 0, length = views.length; i < length; i++) {

            if (views[i].getAttribute('data-url') == url) {
                //restoreView(views[i]);
                //return true;
            }
        }

        return false;
    }

    function restoreView(view) {

        hideViews();
        view.style.display = 'block';
        onViewChange(view);
    }

    function hideViews() {

        var views = getExistingViews();

        for (var i = 0, length = views.length; i < length; i++) {
            views[i].style.display = 'none';
        }
    }

    function onViewChange(view) {

        // TODO: Is there a better way to determine that the view has loaded as opposed to a delay?
        setTimeout(function () {

            Emby.FocusManager.autoFocus(view);
            onShow(view);

        }, 500);
    }

    function onShow(view) {

        require(['bower_components/query-string/index'], function() {
            
            var params = queryString.parse(window.location.search);

            document.dispatchEvent(new CustomEvent("viewshow-" + view.getAttribute('data-id'), {
                detail: {
                    element: view,
                    id: view.getAttribute('data-id'),
                    params: params
                },
                bubbles: true,
                cancelable: false
            }));

            document.dispatchEvent(new CustomEvent("viewshow", {
                detail: {
                    element: view,
                    id: view.getAttribute('data-id'),
                    params: params
                },
                bubbles: true,
                cancelable: false
            }));
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ViewManager = {
        loadView: loadView,
        tryRestoreView: tryRestoreView
    };

})(this, document);
