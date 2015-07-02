define(function () {
    var cssAPI = {};

    cssAPI.normalize = function (name, normalize) {
        if (name.substr(name.length - 4, 4) == '.css')
            name = name.substr(0, name.length - 4);

        return normalize(name);
    }

    var importedCss = [];

    cssAPI.load = function (cssId, req, load, config) {

        // Somehow if the url starts with /css, require will get all screwed up since this extension is also called css
        cssId = cssId.replace('js/requirecss', 'css');
        var url = cssId + '.css';

        if (importedCss.indexOf(url) == -1) {
            importedCss.push(url);

            if (document.createStyleSheet) {
                document.createStyleSheet(url);
            }
            else {
                var link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                link.setAttribute('href', url);
                document.head.appendChild(link);
            }
        }

        load();
    }

    return cssAPI;
});
