define(function () {
    var htmlAPI = {};

    htmlAPI.normalize = function (name, normalize) {
        if (name.substr(name.length - 5, 5) == '.html')
            name = name.substr(0, name.length - 5);

        return normalize(name);
    }

    var importedFiles = [];

    htmlAPI.load = function (htmlId, req, load, config) {

        // Somehow if the url starts with /html, require will get all screwed up since this extension is also called html
        htmlId = htmlId.replace('js/requirehtml', 'html');
        var url = htmlId + '.html';

        if (importedFiles.indexOf(url) == -1) {
            importedFiles.push(url);
			
			var link = document.createElement('link');
                link.setAttribute('rel', 'import');
                link.setAttribute('href', url);
                document.head.appendChild(link);
        }

        load();
    }

    return htmlAPI;
});
