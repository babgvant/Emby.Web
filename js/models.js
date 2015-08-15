(function (globalScope, document) {

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    function normalizeOptions(options) {

        // Just put this on every query
        options.Fields = options.Fields ? (options.Fields + ",PrimaryImageAspectRatio") : "PrimaryImageAspectRatio";
        options.ImageTypeLimit = 1;
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

            if (isPrimary && chapter.ImageTag) {

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

    function fillItemPeopleImages(itemId, people, image, apiClient) {

        var isPrimary = image.type == 'Primary';

        for (var i = 0, length = people.length; i < length; i++) {
            var person = people[i];

            if (isPrimary && person.PrimaryImageTag) {

                var imgUrl = apiClient.getScaledImageUrl(person.Id, {
                    maxWidth: image.width,
                    tag: person.PrimaryImageTag,
                    type: "Primary"
                });

                person.images = person.images || {};
                person.images.primary = imgUrl;
            }
        }
    }

    function chapters(item, options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                var chapters = item.Chapters || [];

                var images = options.images || [];

                for (var i = 0, length = images.length; i < length; i++) {
                    fillChapterImages(item.Id, chapters, images[i], apiClient);
                }

                resolve(chapters);
            });
        });
    }

    function itemPeople(item, options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                var people = item.People || [];

                if (options.limit) {
                    people.length = Math.min(people.length, options.limit);
                }

                people = people.filter(function (p) {
                    return p.PrimaryImageTag;
                });

                var images = options.images || [];

                for (var i = 0, length = images.length; i < length; i++) {
                    fillItemPeopleImages(item.Id, people, images[i], apiClient);
                }

                resolve(people);
            });
        });
    }

    function playlists(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options.IncludeItemTypes = "Playlist";
                normalizeOptions(options);

                apiClient.getJSON(apiClient.getUrl('Users/' + apiClient.getCurrentUserId() + '/Items', options)).done(resolve, reject);
            });
        });
    }

    function channels() {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                apiClient.getChannels({

                    UserId: apiClient.getCurrentUserId()

                }).done(resolve, reject);
            });
        });
    }

    function latestChannelItems(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                normalizeOptions(options);

                var apiClient = connectionManager.currentApiClient();

                options.UserId = apiClient.getCurrentUserId();
                options.Filters = "IsUnplayed";

                apiClient.getJSON(apiClient.getUrl("Channels/Items/Latest", options)).done(resolve, reject);
            });
        });
    }

    function similar(item, options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                normalizeOptions(options);

                var apiClient = connectionManager.currentApiClient();

                options.UserId = apiClient.getCurrentUserId();

                var promise;

                if (item.Type == "Movie") {
                    promise = apiClient.getSimilarMovies(item.Id, options);
                }
                else if (item.Type == "Trailer" || (item.Type == "ChannelVideoItem" && item.ExtraType == "Trailer")) {
                    promise = apiClient.getSimilarTrailers(item.Id, options);
                }
                else if (item.Type == "MusicAlbum") {
                    promise = apiClient.getSimilarAlbums(item.Id, options);
                }
                else if (item.Type == "Series") {
                    promise = apiClient.getSimilarShows(item.Id, options);
                }
                else if (item.MediaType == "Game") {
                    promise = apiClient.getSimilarGames(item.Id, options);
                } else {
                    resolve({
                        Items: [],
                        TotalRecordCount: 0
                    });
                    return;
                }

                promise.done(resolve, reject);
            });
        });
    }

    function liveTvRecommendedPrograms(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                normalizeOptions(options);

                var apiClient = connectionManager.currentApiClient();

                options.UserId = apiClient.getCurrentUserId();

                apiClient.getLiveTvRecommendedPrograms(options).done(resolve, reject);
            });
        });
    }

    function children(item, options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};

                if (item.Type == "Series") {

                }
                else if (item.Type == "Season") {

                }
                else if (item.Type == "MusicAlbum") {

                }
                options.SortBy = "DatePlayed";

                normalizeOptions(options);

                if (item.Type == "Channel") {

                    options.UserId = apiClient.getCurrentUserId();

                    apiClient.getJSON(apiClient.getUrl("Channels/" + item.Id + "/Items", options)).done(resolve, reject);
                } else {

                    options.ParentId = item.Id;

                    apiClient.getItems(apiClient.getCurrentUserId(), options).done(resolve, reject);
                }
            });
        });
    }

    function items(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};

                normalizeOptions(options);

                apiClient.getItems(apiClient.getCurrentUserId(), options).done(resolve, reject);
            });
        });
    }

    function collections(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};
                options.ParentId = null;
                options.IncludeItemTypes = "BoxSet";
                options.Recursive = true;

                normalizeOptions(options);

                apiClient.getItems(apiClient.getCurrentUserId(), options).done(resolve, reject);
            });
        });
    }

    function genres(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};
                options.Recursive = true;

                normalizeOptions(options);

                apiClient.getGenres(apiClient.getCurrentUserId(), options).done(resolve, reject);
            });
        });
    }

    function userViews(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};
                normalizeOptions(options);

                apiClient.getUserViews({}, apiClient.getCurrentUserId()).done(resolve, reject);
            });
        });
    }

    function movieRecommendations(options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                options = options || {};
                normalizeOptions(options);
                options.UserId = apiClient.getCurrentUserId();

                apiClient.getJSON(apiClient.getUrl('Movies/Recommendations', options)).done(resolve, reject);
            });
        });
    }

    globalScope.Emby.Models = {
        resumable: resumable,
        nextUp: nextUp,
        latestItems: latestItems,
        liveTvRecordings: liveTvRecordings,
        item: item,
        chapters: chapters,
        playlists: playlists,
        channels: channels,
        latestChannelItems: latestChannelItems,
        similar: similar,
        liveTvRecommendedPrograms: liveTvRecommendedPrograms,
        itemPeople: itemPeople,
        children: children,
        items: items,
        collections: collections,
        genres: genres,
        userViews: userViews,
        movieRecommendations: movieRecommendations
    };

})(this, document);
