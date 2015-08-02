(function (globalScope) {

    function getDisplayName(item, displayAsSpecial, includeParentInfo) {

        if (!item) {
            throw new Error("null item passed into getPosterViewDisplayName");
        }

        var name = item.EpisodeTitle || item.Name || '';

        if (item.Type == "TvChannel") {

            if (item.Number) {
                return item.Number + ' ' + name;
            }
            return name;
        }
        if (displayAsSpecial && item.Type == "Episode" && item.ParentIndexNumber == 0) {

            name = Globalize.translate('ValueSpecialEpisodeName', name);

        } else if (item.Type == "Episode" && item.IndexNumber != null && item.ParentIndexNumber != null) {

            var displayIndexNumber = item.IndexNumber;

            var number = "E" + displayIndexNumber;

            if (includeParentInfo !== false) {
                number = "S" + item.ParentIndexNumber + ", " + number;
            }

            if (item.IndexNumberEnd) {

                displayIndexNumber = item.IndexNumberEnd;
                number += "-" + displayIndexNumber;
            }

            name = number + " - " + name;

        }

        return name;
    }

    function buildCardsHtml(items, apiClient, options) {

        var className = 'card';

        if (options.className) {
            className += ' ' + options.className;
        }

        if (options.block || options.rows) {
            className += ' block';
        }

        var html = '';
        var itemsInRow = 0;

        for (var i = 0, length = items.length; i < length; i++) {

            if (options.rows && itemsInRow == 0) {
                html += '<div class="cardColumn">';
            }

            var item = items[i];

            html += buildCard(item, apiClient, options, className);
            itemsInRow++;

            if (options.rows && itemsInRow >= options.rows) {
                itemsInRow = 0;
                html += '</div>';
            }
        }

        return html;
    }

    function getCardImageUrl(item, apiClient, options) {

        var width = options.width;
        var height = null;
        var primaryImageAspectRatio = null;
        var forceName = false;

        if (options.preferThumb && item.SeriesThumbImageTag && options.inheritThumb !== false) {

            return apiClient.getScaledImageUrl(item.SeriesId, {
                type: "Thumb",
                maxWidth: width,
                tag: item.SeriesThumbImageTag
            });

        } else if (options.preferThumb && item.ParentThumbItemId && options.inheritThumb !== false) {

            return apiClient.getThumbImageUrl(item.ParentThumbItemId, {
                type: "Thumb",
                maxWidth: width
            });

        } else if (options.preferThumb && item.BackdropImageTags && item.BackdropImageTags.length) {

            return apiClient.getScaledImageUrl(item.Id, {
                type: "Backdrop",
                maxWidth: width,
                tag: item.BackdropImageTags[0]
            });

            forceName = true;

        } else if (item.ImageTags && item.ImageTags.Primary) {

            height = width && primaryImageAspectRatio ? Math.round(width / primaryImageAspectRatio) : null;

            return apiClient.getImageUrl(item.Id, {
                type: "Primary",
                height: height,
                width: width,
                tag: item.ImageTags.Primary
            });

        }
        else if (item.ParentPrimaryImageTag) {

            return apiClient.getImageUrl(item.ParentPrimaryImageItemId, {
                type: "Primary",
                width: width,
                tag: item.ParentPrimaryImageTag
            });
        }
        else if (item.AlbumId && item.AlbumPrimaryImageTag) {

            width = primaryImageAspectRatio ? Math.round(height * primaryImageAspectRatio) : null;

            return apiClient.getScaledImageUrl(item.AlbumId, {
                type: "Primary",
                height: height,
                width: width,
                tag: item.AlbumPrimaryImageTag
            });

        }
        else if (item.Type == 'Season' && item.ImageTags && item.ImageTags.Thumb) {

            return apiClient.getScaledImageUrl(item.Id, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ImageTags.Thumb
            });

        }
        else if (item.BackdropImageTags && item.BackdropImageTags.length) {

            return apiClient.getScaledImageUrl(item.Id, {
                type: "Backdrop",
                maxWidth: width,
                tag: item.BackdropImageTags[0]
            });

        } else if (item.ImageTags && item.ImageTags.Thumb) {

            return apiClient.getScaledImageUrl(item.Id, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ImageTags.Thumb
            });

        } else if (item.SeriesThumbImageTag) {

            return apiClient.getScaledImageUrl(item.SeriesId, {
                type: "Thumb",
                maxWidth: width,
                tag: item.SeriesThumbImageTag
            });

        } else if (item.ParentThumbItemId) {

            return apiClient.getThumbImageUrl(item, {
                type: "Thumb",
                maxWidth: width
            });

        }

        return null;
    }

    function buildCard(item, apiClient, options, className) {

        var imgUrl = getCardImageUrl(item, apiClient, options);

        var cardImageContainer = imgUrl ? ('<div class="cardImageContainer lazy" data-src="' + imgUrl + '">') : '<div class="cardImageContainer">';

        var html = '\
<paper-button raised class="' + className + '"> \
<div class="cardScalable">\
<div class="cardPadder"></div>\
<div class="cardContent">\
' + cardImageContainer + '\
<div class="innerCardFooter">\
<div class="cardText">' + getDisplayName(item) + '</div>\
</div>\
</div>\
</div>\
</div>\
</paper-button>'
        ;

        return html;
    }

    function buildCards(items, apiClient, options) {

        if (options.parentContainer) {
            if (items.length) {
                options.parentContainer.classList.remove('hide');
            } else {
                options.parentContainer.classList.add('hide');
            }
        }

        var html = buildCardsHtml(items, apiClient, options);

        options.itemsContainer.innerHTML = html;

        ImageLoader.lazyChildren(options.itemsContainer);
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.CardBuilder = {
        buildCardsHtml: buildCardsHtml,
        buildCards: buildCards
    };

})(this);