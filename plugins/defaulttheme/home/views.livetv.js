(function (globalScope) {

    function loadLatestRecordings(element) {

        Emby.Models.liveTvRecordings({

            limit: 6,
            IsInProgress: false

        }).then(function (result) {

            var section = element.querySelector('.latestRecordingsSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadNowPlaying(element) {

        Emby.Models.liveTvRecommendedPrograms({

            IsAiring: true,
            limit: 9,
            EnableImageTypes: "Primary"

        }).then(function (result) {

            var section = element.querySelector('.nowPlayingSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                coverImage: true
            });
        });
    }

    function loadUpcomingPrograms(section, options) {

        Emby.Models.liveTvRecommendedPrograms(options).then(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
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

        loadLatestRecordings(element);
        loadNowPlaying(element);

        loadUpcomingPrograms(element.querySelector('.upcomingProgramsSection'), {

            IsAiring: false,
            HasAired: false,
            limit: 6,
            IsMovie: false,
            IsSports: false,
            IsKids: false,
            IsSeries: true

        });

        loadUpcomingPrograms(element.querySelector('.upcomingMoviesSection'), {

            IsAiring: false,
            HasAired: false,
            limit: 6,
            IsMovie: true

        });

        loadUpcomingPrograms(element.querySelector('.upcomingSportsSection'), {

            IsAiring: false,
            HasAired: false,
            limit: 6,
            IsSports: true

        });

        loadUpcomingPrograms(element.querySelector('.upcomingKidsSection'), {

            IsAiring: false,
            HasAired: false,
            limit: 6,
            IsSports: false,
            IsKids: true
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.livetvView = view;

})(this);