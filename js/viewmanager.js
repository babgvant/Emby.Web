(function (globalScope, document) {

    function loadView(options) {

        var animatedPages = document.querySelector('.mainAnimatedPages');
        loadViewInternal(animatedPages, options);
    }

    function loadViewInternal(animatedPages, options) {

        setAnimationStyle(animatedPages, options.transition, options.isBack).then(function () {
            var html = '<div class="page-view" data-id="' + options.id + '" data-url="' + options.url + '">';
            html += options.view;
            html += '</div>';

            var pageIndex = animatedPages.selected === 0 ? 1 : 0;
            var animatable = animatedPages.querySelectorAll('neon-animatable')[pageIndex];

            animatable.innerHTML = html;

            setTimeout(function () {
                animatedPages.selected = pageIndex;
                onViewChange(animatable.querySelector('.page-view'));

            }, 0);
        });
    }

    function setAnimationStyle(animatedPages, transition, isBack) {

        var entryAnimation = '';
        var exitAnimation = '';

        var deps = [];

        if (transition == 'slide') {

            if (isBack) {
                entryAnimation = 'slide-from-left-animation';
                exitAnimation = 'slide-right-animation';

                deps.push('html!bower_components/neon-animation/animations/slide-from-left-animation.html');
                deps.push('html!bower_components/neon-animation/animations/slide-right-animation.html');

            } else {

                deps.push('slide-left-animation');
                deps.push('slide-from-right-animation');

                entryAnimation = 'slide-from-right-animation';
                exitAnimation = 'slide-left-animation';
            }
        } else {
            entryAnimation = '';
            exitAnimation = '';
        }

        return new Promise(function (resolve, reject) {
            require(deps, function () {

                animatedPages.entryAnimation = entryAnimation;
                animatedPages.exitAnimation = exitAnimation;
                resolve();
            });
        });
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

        require(['bower_components/query-string/index'], function () {

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
