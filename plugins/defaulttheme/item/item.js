(function () {

    document.addEventListener("viewinit-defaulttheme-item", function (e) {

        new itemPage(e.detail.element, e.detail.params);
    });

    function itemPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            require(['loading'], function (loading) {

                if (!isRestored) {
                    loading.show();
                }

                Emby.Models.item(params.id).then(function (item) {

                    // If it's a person, leave the backdrop image from wherever we came from
                    if (item.Type != 'Person') {
                        Emby.Backdrop.setBackdrops([item]);
                        setTitle(item);
                    }

                    if (!isRestored) {
                        renderName(view, item);
                        renderImage(view, item);
                        renderChildren(view, item);
                        renderDetails(view, item);
                        renderPeople(view, item);
                        renderScenes(view, item);
                        renderSimilar(view, item);
                        createVerticalScroller(view, self);

                        focusMainSection.call(view.querySelector('.mainSection'));
                    }

                    // Always refresh this
                    renderNextUp(view, item);

                    loading.hide();
                });
            });

            if (!isRestored) {
                view.querySelector('.mainSection').focus = focusMainSection;
            }
        });

        view.addEventListener('viewdestroy', function () {

            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
        });
    }

    function focusMainSection() {

        var elems = Emby.FocusManager.getFocusableElements(this);

        if (elems.length) {
            Emby.FocusManager.focus(elems[0]);
        }
    }

    function setTitle(item) {

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.getApiClient(item.ServerId);

            var imageTags = item.ImageTags || {};
            var url;

            if (imageTags.Logo) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Logo",
                    tag: item.ImageTags.Logo
                });
            }
            else if (item.ParentLogoImageTag) {

                url = apiClient.getScaledImageUrl(item.ParentLogoItemId, {
                    type: "Logo",
                    tag: item.ParentLogoImageTag
                });
            }

            if (url) {

                var pageTitle = document.querySelector('.pageTitle');
                pageTitle.style.backgroundImage = "url('" + url + "')";
                pageTitle.classList.add('pageTitleWithLogo');
            } else {
                Emby.Page.setTitle('');
            }
        });
    }

    function createVerticalScroller(view, pageInstance) {

        require(["slyScroller", 'loading'], function (slyScroller, loading) {

            var scrollFrame = view.querySelector('.scrollFrame');

            var options = {
                horizontal: 0,
                itemNav: 0,
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.scrollSlider'),
                itemSelector: '.card',
                smart: true,
                easing: 'easeOutQuart',
                releaseSwing: true,
                scrollBar: view.querySelector('.scrollbar'),
                scrollBy: 200,
                speed: 200,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                pageInstance.slyFrame = slyFrame;
                slyFrame.init();
                initFocusHandler(view, slyFrame);
            });
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.addEventListener('focusin', function (e) {

            var focused = Emby.FocusManager.focusableParent(e.target);

            if (focused) {
                slyFrame.toCenter(focused);
            }
        });
    }

    function renderName(view, item) {

        var nameContainer = view.querySelector('.nameContainer');
        nameContainer.innerHTML = '<h2>' + DefaultTheme.CardBuilder.getDisplayName(item) + '</h2>';
    }

    function renderImage(view, item) {

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.getApiClient(item.ServerId);

            var imageTags = item.ImageTags || {};
            var imageWidth = 600;
            var url;

            if (imageTags.Primary) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.ImageTags.Primary
                });
            }
            else if (item.BackdropImageTags && item.BackdropImageTags.length) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Backdrop",
                    width: imageWidth,
                    tag: item.BackdropImageTags[0]
                });
            }
            else if (imageTags.Thumb) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Thumb",
                    width: imageWidth,
                    tag: item.ImageTags.Thumb
                });
            }
            else if (imageTags.Disc) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Disc",
                    width: imageWidth,
                    tag: item.ImageTags.Disc
                });
            }
            else if (item.AlbumId && item.AlbumPrimaryImageTag) {

                url = apiClient.getScaledImageUrl(item.AlbumId, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.AlbumPrimaryImageTag
                });
            }

            var detailImage = view.querySelector('.detailImageContainer');

            if (url) {
                detailImage.classList.remove('hide');
                detailImage.innerHTML = '<img class="detailImage" src="' + url + '" />';
            } else {
                detailImage.classList.add('hide');
                detailImage.innerHTML = '';
            }
        });
    }

    function renderDetails(view, item) {

        if (item.Type == "Season") {
            view.querySelector('.mainSection').classList.add('miniMainSection');
        } else {
            view.querySelector('.mainSection').classList.remove('miniMainSection');
        }

        var genresElem = view.querySelector('.genres')
        if (item.Genres && item.Genres.length) {
            genresElem.classList.remove('hide');
            genresElem.innerHTML = item.Genres.map(function (i) {

                return i;

            }).join('<span class="bulletSeparator"> &bull; </span>');
        } else {
            genresElem.classList.add('hide');
        }

        var overviewElem = view.querySelector('.overview')
        if (item.Overview) {
            overviewElem.classList.remove('hide');
            overviewElem.innerHTML = item.Overview;
        } else {
            overviewElem.classList.add('hide');
        }

        renderMediaInfo(view, item);
    }

    function renderMediaInfo(view, item) {

        var html = '';

        html += getStarIconsHtml(item);

        var miscInfo = [];

        var text, date;

        if (item.Type == "Episode" || item.MediaType == 'Photo') {

            if (item.PremiereDate) {

                try {
                    date = Emby.DateTime.parseISO8601Date(item.PremiereDate);

                    text = date.toLocaleDateString();
                    miscInfo.push(text);
                }
                catch (e) {
                    Logger.log("Error parsing date: " + item.PremiereDate);
                }
            }
        }

        if (item.StartDate) {

            try {
                date = Emby.DateTime.parseISO8601Date(item.StartDate);

                text = date.toLocaleDateString();
                miscInfo.push(text);

                if (item.Type != "Recording") {
                    text = getDisplayTime(date);
                    miscInfo.push(text);
                }
            }
            catch (e) {
                Logger.log("Error parsing date: " + item.PremiereDate);
            }
        }

        if (item.ProductionYear && item.Type == "Series") {

            if (item.Status == "Continuing") {
                miscInfo.push(Globalize.translate('ValueSeriesYearToPresent', item.ProductionYear));

            }
            else if (item.ProductionYear) {

                text = item.ProductionYear;

                if (item.EndDate) {

                    try {

                        var endYear = Emby.DateTime.parseISO8601Date(item.EndDate).getFullYear();

                        if (endYear != item.ProductionYear) {
                            text += "-" + Emby.DateTime.parseISO8601Date(item.EndDate).getFullYear();
                        }

                    }
                    catch (e) {
                        Logger.log("Error parsing date: " + item.EndDate);
                    }
                }

                miscInfo.push(text);
            }
        }

        if (item.Type != "Series" && item.Type != "Episode" && item.MediaType != 'Photo') {

            if (item.ProductionYear) {

                miscInfo.push(item.ProductionYear);
            }
            else if (item.PremiereDate) {

                try {
                    text = Emby.DateTime.parseISO8601Date(item.PremiereDate).getFullYear();
                    miscInfo.push(text);
                }
                catch (e) {
                    Logger.log("Error parsing date: " + item.PremiereDate);
                }
            }
        }

        var minutes;

        if (item.RunTimeTicks && item.Type != "Series") {

            if (item.Type == "Audio") {

                miscInfo.push(getDisplayRuntime(item.RunTimeTicks));

            } else {
                minutes = item.RunTimeTicks / 600000000;

                minutes = minutes || 1;

                miscInfo.push(Math.round(minutes) + " mins");
            }
        }

        if (item.OfficialRating && item.Type !== "Season" && item.Type !== "Episode") {
            miscInfo.push(item.OfficialRating);
        }

        if (item.Video3DFormat) {
            miscInfo.push("3D");
        }

        if (item.MediaType == 'Photo' && item.Width && item.Height) {
            miscInfo.push(item.Width + "x" + item.Height);
        }

        html += miscInfo.map(function (m) {

            return '<div class="mediaInfoItem">' + m + '</div>';

        }).join('');

        view.querySelector('.mediaInfo').innerHTML = html;
    }

    function getStarIconsHtml(item) {

        var html = '';

        var rating = item.CommunityRating;

        if (rating) {
            html += '<div class="starRatingContainer">';

            for (var i = 0; i < 5; i++) {
                var starValue = (i + 1) * 2;

                if (rating < starValue - 2) {
                    html += '<iron-icon icon="star" class="emptyStar"></iron-icon>';
                }
                else if (rating < starValue) {
                    html += '<iron-icon icon="star-half"></iron-icon>';
                }
                else {
                    html += '<iron-icon icon="star"></iron-icon>';
                }
            }

            html += '</div>';
        }

        return html;
    }

    function renderNextUp(view, item) {

        var section = view.querySelector('.nextUpSection');

        var userData = item.UserData || {};

        if (item.Type != 'Series' || !userData.PlayedPercentage) {
            section.classList.add('hide');
            return;
        }

        Emby.Models.nextUp({

            SeriesId: item.Id

        }).then(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                width: DefaultTheme.CardBuilder.homeThumbWidth,
                showTitle: true
            });
        });
    }

    function renderChildren(view, item) {

        var section = view.querySelector('.childrenSection');

        if (!item.ChildCount) {
            section.classList.add('hide');
            return;
        }

        var headerText = section.querySelector('h2');
        var showTitle = false;

        if (item.Type == "Series") {
            headerText.innerHTML = Globalize.translate('Seasons');
            headerText.classList.remove('hide');

        } else if (item.Type == "Season") {
            headerText.innerHTML = Globalize.translate('Episodes');
            headerText.classList.remove('hide');
            showTitle = true;

        } else if (item.Type == "MusicAlbum") {
            headerText.classList.add('hide');

        } else {
            section.classList.add('hide');
            return;
        }

        Emby.Models.children(item, {

        }).then(function (result) {

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showTitle: showTitle
            });
        });
    }

    function renderPeople(view, item) {

        Emby.Models.itemPeople(item, {

            limit: 24,
            images: [
            {
                type: 'Primary',
                width: 250
            }]

        }).then(function (people) {

            var section = view.querySelector('.peopleSection');

            if (!people.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            require([Emby.PluginManager.mapRequire('defaulttheme', 'cards/peoplecardbuilder.js')], function () {
                DefaultTheme.PeopleCardBuilder.buildPeopleCards(people, {
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'portraitCard itemPersonThumb',
                    coverImage: true
                });
            });
        });
    }

    function renderScenes(view, item) {

        Emby.Models.chapters(item, {
            images: [
            {
                type: 'Primary',
                width: 440
            }]

        }).then(function (chapters) {

            var section = view.querySelector('.scenesSection');

            if (!chapters.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            require([Emby.PluginManager.mapRequire('defaulttheme', 'cards/chaptercardbuilder.js')], function () {
                DefaultTheme.ChapterCardBuilder.buildChapterCards(chapters, {
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'backdropCard',
                    coverImage: true
                });
            });
        });
    }

    function renderSimilar(view, item) {

        Emby.Models.similar(item, {

            Limit: 12

        }).then(function (result) {

            var section = view.querySelector('.similarSection');

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            section.querySelector('h2').innerHTML = Globalize.translate('SimilarTo', item.Name);

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto'
            });
        });
    }

    function getDisplayRuntime(ticks) {

        var ticksPerHour = 36000000000;
        var ticksPerMinute = 600000000;
        var ticksPerSecond = 10000000;

        var parts = [];

        var hours = ticks / ticksPerHour;
        hours = Math.floor(hours);

        if (hours) {
            parts.push(hours);
        }

        ticks -= (hours * ticksPerHour);

        var minutes = ticks / ticksPerMinute;
        minutes = Math.floor(minutes);

        ticks -= (minutes * ticksPerMinute);

        if (minutes < 10 && hours) {
            minutes = '0' + minutes;
        }
        parts.push(minutes);

        var seconds = ticks / ticksPerSecond;
        seconds = Math.floor(seconds);

        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        parts.push(seconds);

        return parts.join(':');
    }

    function getDisplayTime(date) {

        if ((typeof date).toString().toLowerCase() === 'string') {
            try {

                date = Emby.DateTime.parseISO8601Date(date);

            } catch (err) {
                return date;
            }
        }

        var lower = date.toLocaleTimeString().toLowerCase();

        var hours = date.getHours();
        var minutes = date.getMinutes();

        var text;

        if (lower.indexOf('am') != -1 || lower.indexOf('pm') != -1) {

            var suffix = hours > 11 ? 'pm' : 'am';

            hours = (hours % 12) || 12;

            text = hours;

            if (minutes) {

                text += ':';
                if (minutes < 10) {
                    text += '0';
                }
                text += minutes;
            }

            text += suffix;

        } else {
            text = hours + ':';

            if (minutes < 10) {
                text += '0';
            }
            text += minutes;
        }

        return text;
    }

})();