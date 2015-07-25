define(function () {
    var requireCss = {};

    requireCss.normalize = function (name, normalize) {
        if (name.substr(name.length - 4, 4) == '.css')
            name = name.substr(0, name.length - 4);

        return normalize(name);
    }

    var importedCss = [];

    requireCss.load = function (cssId, req, load, config) {

        // Somehow if the url starts with /css, require will get all screwed up since this extension is also called css
        cssId = cssId.replace('js/requirecss', 'css');
        var url = cssId + '.css';

        var cssClass = 'themecss';

        if (url.indexOf('theme#') != -1) {
            url = url.replace('theme#', '');
        }

        if (importedCss.indexOf(url) == -1) {
            importedCss.push(url);

            var link = document.createElement('link');

            if (cssClass) {
                link.classList.add(cssClass);
            }

            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', url);
            document.head.appendChild(link);
        }

        load();
    }

    return requireCss;
});
