(function (globalScope) {

    var thumbWidth = 320;

    function loadResume(element, parentId, apiClient) {

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            IncludeItemTypes: "Episode",
            Filters: "IsResumable",
            Limit: 6,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio,UserData",
            ExcludeLocationTypes: "Virtual",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        apiClient.getItems(apiClient.getCurrentUserId(), options).done(function (result) {

            var resumeSection = element.querySelector('.resumeSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                className: 'backdropCard homebackdropCard',
                rows: 3,
                width: thumbWidth,
                preferThumb: true
            });
        });
    }

    function loadNextUp(element, parentId, apiClient) {

        var options = {

            Limit: 18,
            Fields: "PrimaryImageAspectRatio,SeriesInfo,DateCreated,SyncInfo",
            UserId: apiClient.getCurrentUserId(),
            ExcludeLocationTypes: "Virtual",
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            ParentId: parentId
        };

        apiClient.getNextUpEpisodes(options).done(function (result) {

            var resumeSection = element.querySelector('.nextUpSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                className: 'backdropCard homebackdropCard',
                rows: 3,
                width: thumbWidth,
                preferThumb: true
            });
        });
    }

    function loadLatest(element, parentId, apiClient) {

        var options = {

            IncludeItemTypes: "Episode",
            Limit: 9,
            Fields: "PrimaryImageAspectRatio,SyncInfo",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        apiClient.getJSON(apiClient.getUrl('Users/' + apiClient.getCurrentUserId() + '/Items/Latest', options)).done(function (result) {

            var resumeSection = element.querySelector('.latestSection');

            DefaultTheme.CardBuilder.buildCards(result, apiClient, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                className: 'backdropCard homebackdropCard',
                rows: 3,
                width: thumbWidth,
                preferThumb: true,
                showGroupCount: true
            });
        });
    }

    function loadSpotlight(element, parentId, apiClient) {

        var options = {

            SortBy: "Random",
            IncludeItemTypes: "Series",
            Limit: 20,
            Recursive: true,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"
        };

        apiClient.getItems(apiClient.getCurrentUserId(), options).done(function (result) {

            var card = element.querySelector('.homebackdropSpotlightCard');

            require([Emby.PluginManager.mapRequire('defaulttheme', 'home/spotlight')], function () {

                new DefaultTheme.spotlight(card, result.Items, thumbWidth * 2, apiClient);
            });
        });
    }

    function view(element, parentId) {

        var self = this;

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            loadResume(element, parentId, apiClient);
            loadNextUp(element, parentId, apiClient);
            loadLatest(element, parentId, apiClient);
            loadSpotlight(element, parentId, apiClient);
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.tvView = view;

})(this);