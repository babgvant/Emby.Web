(function (globalScope, document) {

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    function normalizeOptions(options) {

        // Just put this on every query
        options.Fields = options.Fields ? (options.Fields + ",PrimaryImageAspectRatio") : "PrimaryImageAspectRatio";
    }

    function resumable(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};
                options.SortBy = "DatePlayed";
                options.SortOrder = "Descending";
                options.MediaTypes = "Video";
                options.Filters = "IsResumable";
                options.Recursive = true;
                normalizeOptions(options);

                apiClient.getItems(apiClient.getCurrentUserId(), options).done(resolve, reject);
            });
        });
    }

    function nextUp(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                options = options || {};
                normalizeOptions(options);

                var apiClient = connectionManager.currentApiClient();

                options.UserId = apiClient.getCurrentUserId();

                apiClient.getNextUpEpisodes(options).done(resolve, reject);
            });
        });
    }

    function latestItems(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                options = options || {};
                normalizeOptions(options);

                var apiClient = connectionManager.currentApiClient();

                apiClient.getJSON(apiClient.getUrl('Users/' + apiClient.getCurrentUserId() + '/Items/Latest', options)).done(resolve, reject);
            });
        });
    }

    function liveTvRecordings(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                options = options || {};
                normalizeOptions(options);

                var apiClient = connectionManager.currentApiClient();

                options.UserId = apiClient.getCurrentUserId();

                apiClient.getLiveTvRecordings(options).done(resolve, reject);
            });
        });
    }

    function item(id) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                apiClient.getItem(apiClient.getCurrentUserId(), id).done(resolve, reject);
            });
        });
    }

    function fillChapterImages(itemId, chapters, image, apiClient) {

        var isPrimary = image.type == 'Primary';

        for (var i = 0, length = chapters.length; i < length; i++) {
            var chapter = chapters[i];

            if (isPrimary) {

                var imgUrl = apiClient.getScaledImageUrl(itemId, {
                    maxWidth: image.width,
                    tag: chapter.ImageTag,
                    type: "Chapter",
                    index: i
                });

                chapter.images = chapter.images || {};
                chapter.images.primary = imgUrl;
            }
        }
    }

    function chapters(item, options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                var chapters = item.Chapters || {};

                var images = options.images || [];

                for (var i = 0, length = images.length; i < length; i++) {
                    fillChapterImages(item.Id, chapters, images[i], apiClient);
                }

                resolve(chapters);
            });
        });
    }

    globalScope.Emby.Models = {
        resumable: resumable,
        nextUp: nextUp,
        latestItems: latestItems,
        liveTvRecordings: liveTvRecordings,
        item: item,
        chapters: chapters
    };

})(this, document);
