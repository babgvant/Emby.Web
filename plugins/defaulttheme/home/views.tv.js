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
                preferThumb: true
            });
        });
    }

    function view(element, parentId) {

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            loadResume(element, parentId, apiClient);
            loadNextUp(element, parentId, apiClient);
            loadLatest(element, parentId, apiClient);
        });
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.tvView = view;

})(this);