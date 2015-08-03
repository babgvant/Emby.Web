(function (globalScope) {

    function loadChannels(element, parentId, apiClient) {

        apiClient.getChannels({

            UserId: apiClient.getCurrentUserId()

        }).done(function (result) {

            var section = element.querySelector('.channelsSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard homebackdropCard',
                rows: 3,
                width: DefaultTheme.CardBuilder.homeThumbWidth,
                preferThumb: true
            });

            var latestContainer = element.querySelector('.latestContainer');

            for (var i = 0, length = result.Items.length; i < length; i++) {
                loadLatest(latestContainer, result.Items[i], apiClient);
            }
        });
    }

    function loadLatest(element, channel, apiClient) {

        var html = '\
<div class="sectionTitle">'+ Globalize.translate('LatestFromValue', channel.Name) + '</div>\
<div class="itemsContainer">\
</div>';

        var section = document.createElement('div');
        section.classList.add('hide');
        section.classList.add('homeSection');

        section.innerHTML = html;
        element.appendChild(section);

        var options = {

            Limit: 6,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsUnplayed",
            UserId: apiClient.getCurrentUserId(),
            ChannelIds: channel.Id
        };

        apiClient.getJSON(apiClient.getUrl("Channels/Items/Latest", options)).done(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, apiClient, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                preferThumb: true
            });
        });
    }

    function view(element, parentId) {

        var self = this;

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            loadChannels(element, parentId, apiClient);
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.channelsView = view;

})(this);