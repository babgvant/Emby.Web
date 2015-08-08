(function (globalScope) {

    function loadResume(element, parentId) {

        var options = {

            Limit: 6,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.resumable(options).then(function (result) {

            var resumeSection = element.querySelector('.resumeSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                shape: 'backdropCard homebackdropCard',
                rows: 3,
                width: DefaultTheme.CardBuilder.homeThumbWidth,
                preferThumb: true
            });
        });
    }

    function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Movie",
            Limit: 10,
            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.latestItems(options).then(function (result) {

            var resumeSection = element.querySelector('.latestSection');

            DefaultTheme.CardBuilder.buildCards(result, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                shape: 'portraitCard homePortraitCard',
                rows: 2,
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadSpotlight(element, parentId) {

        var options = {

            SortBy: "Random",
            IncludeItemTypes: "Movie",
            Limit: 20,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"
        };

        Emby.Models.items(options).then(function (result) {

            var card = element.querySelector('.homebackdropSpotlightCard');

            require([Emby.PluginManager.mapRequire('defaulttheme', 'home/spotlight.js')], function () {

                new DefaultTheme.spotlight(card, result.Items, DefaultTheme.CardBuilder.homeThumbWidth * 2);
            });
        });
    }

    function view(element, parentId) {

        var self = this;

        loadResume(element, parentId);
        loadLatest(element, parentId);
        loadSpotlight(element, parentId);

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.moviesView = view;

})(this);