define([], function () {

    function loadView(options) {

        return new Promise(function (resolve, reject) {

            var animatedPages = document.querySelector('.mainAnimatedPages');

            var html = '<div class="page-view" data-id="' + options.id + '" data-url="' + options.url + '">';
            html += options.view;
            html += '</div>';

            var mainAnimatedPages = document.querySelector('.mainAnimatedPages');
            mainAnimatedPages.innerHTML = html;

            resolve(mainAnimatedPages.querySelector('.page-view'));
        });
    }

    function replaceAnimatedPages() {
        var elem = document.querySelector('neon-animated-pages.mainAnimatedPages');

        if (elem) {
            var div = document.createElement('div');
            div.classList.add('mainAnimatedPages');
            elem.parentNode.replaceChild(div, elem);
        }
    }

    replaceAnimatedPages();

    return {
        loadView: loadView
    };
});