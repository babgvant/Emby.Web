(function (globalScope) {

    function loadAll(element, parentId, apiClient) {

        var options = {

            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            IncludeItemTypes: "Playlist"
        };

        apiClient.getJSON(apiClient.getUrl('Users/' + apiClient.getCurrentUserId() + '/Items', options)).done(function (result) {

            var section = element.querySelector('.allSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome'
            });
        });
    }

    function view(element, parentId) {
        var self = this;

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            loadAll(element, parentId, apiClient);
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.playlistsView = view;

})(this);