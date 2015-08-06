(function (globalScope) {

    function loadAll(element, parentId) {

        var options = {

            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.playlists(options).then(function (result) {

            var section = element.querySelector('.allSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome'
            });
        });
    }

    function view(element, parentId) {
        var self = this;

        loadAll(element, parentId);

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.playlistsView = view;

})(this);