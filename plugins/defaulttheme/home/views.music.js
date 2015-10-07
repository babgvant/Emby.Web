(function (globalScope) {

    function loadLatest(element, parentId, apiClient) {

        var options = {

            IncludeItemTypes: "Audio",
            Limit: 9,
            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        apiClient.getJSON(apiClient.getUrl('Users/' + apiClient.getCurrentUserId() + '/Items/Latest', options)).done(function (result) {

            var section = element.querySelector('.latestSection');

            DefaultTheme.CardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadPlaylists(element, parentId, apiClient) {

        var options = {

            SortBy: "SortName",
            SortOrder: "Ascending",
            IncludeItemTypes: "Playlist",
            Recursive: true,
            ParentId: parentId,
            Fields: "PrimaryImageAspectRatio,SortName,CumulativeRunTimeTicks,CanDelete",
            StartIndex: 0,
            Limit: 9
        };

        apiClient.getItems(apiClient.getCurrentUserId(), options).done(function (result) {

            var section = element.querySelector('.playlistsSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadRecentlyPlayed(element, parentId, apiClient) {

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 9,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        apiClient.getItems(apiClient.getCurrentUserId(), options).done(function (result) {

            var section = element.querySelector('.recentlyPlayedSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function loadFrequentlyPlayed(element, parentId, apiClient) {

        var options = {

            SortBy: "PlayCount",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 9,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        apiClient.getItems(apiClient.getCurrentUserId(), options).done(function (result) {

            var section = element.querySelector('.frequentlyPlayedSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function gotoMusicView(tab, parentId) {

        Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'music/music.html?tab=' + tab + "&parentid=" + parentId));
    }

    function view(element, parentId) {
        var self = this;

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            loadLatest(element, parentId, apiClient);
            loadPlaylists(element, parentId, apiClient);
            loadRecentlyPlayed(element, parentId, apiClient);
            loadFrequentlyPlayed(element, parentId, apiClient);
        });

        element.querySelector('.artistsCard').addEventListener('click', function () {
            gotoMusicView('albumartists', parentId);
        });

        element.querySelector('.albumsCard').addEventListener('click', function () {
            gotoMusicView('albums', parentId);
        });

        element.querySelector('.genresCard').addEventListener('click', function () {
            gotoMusicView('genres', parentId);
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.musicView = view;

})(this);