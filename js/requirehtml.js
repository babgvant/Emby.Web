define(function () {
    var cssAPI = {};

    cssAPI.normalize = function (name, normalize) {
        if (name.substr(name.length - 5, 5) == '.html')
            name = name.substr(0, name.length - 5);

        return normalize(name);
    }

    var importedFiles = [];

    cssAPI.load = function (cssId, req, load, config) {

        // Somehow if the url starts with /css, require will get all screwed up since this extension is also called css
        cssId = cssId.replace('js/requirehtml', 'html');
        var url = cssId + '.html';

        if (importedFiles.indexOf(url) == -1) {
            importedFiles.push(url);

            var link = document.createElement('link');
            link.rel = 'import';
            link.href = url;
            document.head.appendChild(link);

            setTimeout(function() {
                load();
            }, 100);
            return;
        }

        load();
    }

    return cssAPI;
});
