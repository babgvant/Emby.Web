(function (globalScope) {

    function loadLatest(element, parentId) {

        var options = {

            Limit: 24,
            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.latestItems(options).then(function (result) {

            var section = element.querySelector('.latestSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome'
            });
        });
    }

    function view(element, parentId) {
        var self = this;

        loadLatest(element, parentId);

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.genericView = view;

})(this);