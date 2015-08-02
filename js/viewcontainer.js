define([], function () {

    function loadView(options) {

        return new Promise(function (resolve, reject) {

            var animatedPages = document.querySelector('.mainAnimatedPages');

            setAnimationStyle(animatedPages, options.transition, options.isBack).then(function () {
                var html = '<div class="page-view" data-id="' + options.id + '" data-url="' + options.url + '">';
                html += options.view;
                html += '</div>';

                var pageIndex = animatedPages.selected === 0 ? 1 : 0;
                var animatable = animatedPages.querySelectorAll('neon-animatable')[pageIndex];

                animatable.innerHTML = html;

                setTimeout(function () {
                    animatedPages.selected = pageIndex;
                    resolve(animatable.querySelector('.page-view'));

                }, 0);
            });
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

                deps.push('slide-from-left-animation');
                deps.push('slide-right-animation');

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

    return {
        loadView: loadView
    };
});