(function (globalScope) {

    function loadLatestRecordings(element, apiClient) {

        Emby.Models.liveTvRecordings({

            limit: 6,
            IsInProgress: false

        }).then(function (result) {

            var section = element.querySelector('.latestRecordingsSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadNowPlaying(element, apiClient) {

        apiClient.getLiveTvRecommendedPrograms({

            userId: apiClient.getCurrentUserId(),
            IsAiring: true,
            limit: 9,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary"

        }).done(function (result) {

            var section = element.querySelector('.nowPlayingSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                coverImage: true
            });
        });
    }

    function loadUpcomingPrograms(section, apiClient, options) {

        apiClient.getLiveTvRecommendedPrograms(options).done(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                coverImage: true
            });
        });
    }

    function view(element, parentId) {
        var self = this;

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            loadLatestRecordings(element, apiClient);
            loadNowPlaying(element, apiClient);

            loadUpcomingPrograms(element.querySelector('.upcomingProgramsSection'), apiClient, {

                userId: apiClient.getCurrentUserId(),
                IsAiring: false,
                HasAired: false,
                limit: 6,
                IsMovie: false,
                IsSports: false,
                IsKids: false,
                IsSeries: true

            });

            loadUpcomingPrograms(element.querySelector('.upcomingMoviesSection'), apiClient, {

                userId: apiClient.getCurrentUserId(),
                IsAiring: false,
                HasAired: false,
                limit: 6,
                IsMovie: true

            });

            loadUpcomingPrograms(element.querySelector('.upcomingSportsSection'), apiClient, {

                userId: apiClient.getCurrentUserId(),
                IsAiring: false,
                HasAired: false,
                limit: 6,
                IsSports: true

            });

            loadUpcomingPrograms(element.querySelector('.upcomingKidsSection'), apiClient, {

                userId: apiClient.getCurrentUserId(),
                IsAiring: false,
                HasAired: false,
                limit: 6,
                IsSports: false,
                IsKids: true
            });
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.livetvView = view;

})(this);