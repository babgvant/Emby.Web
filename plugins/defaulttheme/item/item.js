(function () {

    document.addEventListener("viewinit-defaulttheme-item", function (e) {

        new itemPage(e.detail.element, e.detail.params);
    });

    function itemPage(view, params) {

        var self = this;
        var currentItem;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            require(['loading'], function (loading) {

                if (!isRestored) {
                    loading.show();
                }

                Emby.Models.item(params.id).then(function (item) {

                    currentItem = item;

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

                view.querySelector('.btnPlay').addEventListener('click', play);
                view.querySelector('.btnTrailer').addEventListener('click', playTrailer);
            }
        });

        view.addEventListener('viewdestroy', function () {

            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
        });

        function playTrailer() {
            Emby.PlaybackManager.playTrailer(currentItem);
        }

        function play() {
            Emby.PlaybackManager.play({
                items: [currentItem]
            });
        }
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
                pageTitle.innerHTML = '';
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
                speed: 300,
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

        if (item.Type == "Season" || item.Type == "MusicAlbum" || item.Type == "MusicArtist" || item.Type == "Playlist") {
            view.querySelector('.mainSection').classList.add('miniMainSection');
        } else {
            view.querySelector('.mainSection').classList.remove('miniMainSection');
        }

        var overviewElem = view.querySelector('.overview')
        if (item.Overview && item.Type != 'MusicArtist' && item.Type != 'MusicAlbum') {
            overviewElem.classList.remove('hide');
            overviewElem.innerHTML = item.Overview;
        } else {
            overviewElem.classList.add('hide');
        }

        if (item.LocalTrailerCount) {
            view.querySelector('.btnTrailer').classList.remove('hide');
        } else {
            view.querySelector('.btnTrailer').classList.add('hide');
        }

        if (Emby.PlaybackManager.canPlay(item)) {
            view.querySelector('.btnPlay').classList.remove('hide');
        } else {
            view.querySelector('.btnPlay').classList.add('hide');
        }

        var mediaInfoHtml = DefaultTheme.CardBuilder.getMediaInfoHtml(item);
        var mediaInfoElem = view.querySelector('.mediaInfo');
        var sideMediaInfoElem = view.querySelector('.sideMediaInfo');

        if (!mediaInfoHtml) {
            mediaInfoElem.classList.add('hide');
            sideMediaInfoElem.classList.add('hide');
        }
        else if (item.Type == 'MusicAlbum' || item.Type == 'Playlist') {
            mediaInfoElem.classList.add('hide');
            sideMediaInfoElem.innerHTML = mediaInfoHtml;
            sideMediaInfoElem.classList.remove('hide');
        } else {
            mediaInfoElem.classList.remove('hide');
            mediaInfoElem.innerHTML = mediaInfoHtml;
            sideMediaInfoElem.classList.add('hide');
        }

        var genresHtml = (item.Genres || []).map(function (i) {

            return i;

        }).join('<span class="bulletSeparator"> &bull; </span>');

        var genresElem = view.querySelector('.genres')
        var sideGenresElem = view.querySelector('.sideGenres');

        if (!genresHtml) {
            genresElem.classList.add('hide');
            sideGenresElem.classList.add('hide');
        }
        else if (item.Type == 'MusicAlbum' || item.Type == 'Playlist') {
            genresElem.classList.add('hide');
            sideGenresElem.innerHTML = genresHtml;
            sideGenresElem.classList.remove('hide');
        } else {
            genresElem.classList.remove('hide');
            genresElem.innerHTML = genresHtml;
            sideGenresElem.classList.add('hide');
        }
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

    function renderTrackList(view, item) {

        var section = view.querySelector('.trackList');

        if (item.Type != 'Playlist' && item.Type != 'MusicAlbum') {
            section.classList.add('hide');
            return;
        }

        if (!item.ChildCount) {
            section.classList.add('hide');
            return;
        }

        Emby.Models.children(item, {}).then(function (result) {

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            section.innerHTML = DefaultTheme.CardBuilder.getListViewHtml(result.Items, {
                showIndexNumber: true,
                action: 'playallfromhere'
            });

            Emby.ImageLoader.lazyChildren(section);
        });
    }

    function renderChildren(view, item) {

        renderTrackList(view, item);

        var section = view.querySelector('.childrenSection');

        if (item.Type != 'MusicArtist') {
            if (!item.ChildCount || item.Type == 'Playlist' || item.Type == 'MusicAlbum') {
                section.classList.add('hide');
                return;
            }
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

        } else if (item.Type == "MusicArtist") {
            headerText.innerHTML = Globalize.translate('Albums');
            headerText.classList.remove('hide');

        } else if (item.Type == "MusicAlbum") {
            headerText.classList.add('hide');

        } else {
            section.classList.add('hide');
            return;
        }

        var promise = item.Type == 'MusicArtist' ?
            Emby.Models.items({
                IncludeItemTypes: 'MusicAlbum',
                Recursive: true,
                ArtistIds: item.Id
            }) :
            Emby.Models.children(item, {});

        promise.then(function (result) {

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoVertical',
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
                shape: 'autoVertical'
            });
        });
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