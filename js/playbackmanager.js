(function (globalScope) {

    function playbackManager() {

        var self = this;
        var lastBitrateDetect = 0;
        var currentPlayer;
        var currentItem;
        var currentMediaSource;
        self.playlist = [];
        var currentPlaylistIndex;

        self.currentItem = function () {
            return currentItem;
        };

        self.currentPlayer = function () {
            return currentPlayer;
        };

        self.isPlayingVideo = function () {
            return false;
        };

        self.getPlayers = function () {

            return Emby.PluginManager.ofType('mediaplayer');
        };

        self.canPlay = function (item) {

            var itemType = item.Type;
            var locationType = item.LocationType;
            var mediaType = item.MediaType;

            if (itemType == "Program") {
                return false;
            }

            if (itemType == "MusicGenre" || itemType == "Season" || itemType == "Series" || itemType == "BoxSet" || itemType == "MusicAlbum" || itemType == "MusicArtist" || itemType == "Playlist") {
                return true;
            }

            if (locationType == "Virtual") {
                return false;
            }

            return self.getPlayers().filter(function (p) {

                return p.canPlayMediaType(mediaType);

            }).length;
        };

        self.isMuted = function () {

            if (currentPlayer) {
                return currentPlayer.isMuted();
            }

            return false;
        };

        self.setMute = function (mute) {

            if (currentPlayer) {
                currentPlayer.setMute(mute);
            }
        };

        self.toggleMute = function (mute) {

            if (currentPlayer) {
                self.setMute(!self.isMuted());
            }
        };

        self.volume = function (val) {

            if (currentPlayer) {
                return currentPlayer.volume(val);
            }
        };

        self.volumeUp = function () {

            if (currentPlayer) {
                currentPlayer.volumeUp();
            }
        };

        self.volumeDown = function () {

            if (currentPlayer) {
                currentPlayer.volumeDown();
            }
        };

        self.setAudioStreamIndex = function (index) {

            if (currentPlayer) {
                currentPlayer.setAudioStreamIndex(index);
            }
        };

        self.setSubtitleStreamIndex = function (index) {

            if (currentPlayer) {
                currentPlayer.setSubtitleStreamIndex(index);
            }
        };

        self.stop = function () {
            if (currentPlayer) {
                currentPlayer.stop();
            }
        };

        self.playPause = function () {
            if (currentPlayer) {

                if (currentPlayer.paused()) {
                    self.unpause();
                } else {
                    self.pause();
                }
            }
        };

        self.pause = function () {
            if (currentPlayer) {
                currentPlayer.pause();
            }
        };

        self.unpause = function () {
            if (currentPlayer) {
                currentPlayer.unpause();
            }
        };

        self.nextTrack = function () {
        };

        self.previousTrack = function () {
        };

        self.seek = function (ticks) {
            if (currentPlayer) {
                currentPlayer.currentTime(ticks / 10000);
            }
        };

        self.seekPercent = function (percent) {

            if (currentMediaSource) {
                var ticks = currentMediaSource.RunTimeTicks || 0;

                percent /= 100;
                ticks *= percent;
                self.seek(ticks);
            }
        };

        self.playTrailer = function (item) {

        };

        self.play = function (options) {

            validatePlayback(function () {
                if (typeof (options) === 'string') {
                    options = { ids: [options] };
                }

                playItems(options);
            });
        };

        self.shuffle = function (id) {

            validatePlayback(function () {
                playItems({
                    ids: id
                }, 'Shuffle');
            });
        };

        self.instantMix = function (id) {

            Emby.Models.instantMix(id).then(function (result) {

                validatePlayback(function () {
                    playItems({
                        items: result.Items
                    });
                });
            });
        };

        self.getPlayerState = function () {
            return getPlayerStateInternal(currentPlayer, currentItem, currentMediaSource);
        };

        function getPlayerStateInternal(mediaRenderer, item, mediaSource) {

            var state = {
                PlayState: {}
            };

            if (mediaRenderer) {

                state.PlayState.VolumeLevel = mediaRenderer.volume();
                state.PlayState.IsMuted = mediaRenderer.isMuted();
                state.PlayState.IsPaused = mediaRenderer.paused();
                state.PlayState.PositionTicks = getCurrentTicks(mediaRenderer);
                state.PlayState.RepeatMode = self.getRepeatMode();

                //var currentSrc = mediaRenderer.currentSrc();

                //if (currentSrc) {

                //    var audioStreamIndex = getParameterByName('AudioStreamIndex', currentSrc);

                //    if (audioStreamIndex) {
                //        state.PlayState.AudioStreamIndex = parseInt(audioStreamIndex);
                //    }
                //    state.PlayState.SubtitleStreamIndex = self.currentSubtitleStreamIndex;

                //    state.PlayState.PlayMethod = self.streamInfo.playMethod;

                //    state.PlayState.LiveStreamId = mediaSource.LiveStreamId;
                //    state.PlayState.PlaySessionId = getParameterByName('PlaySessionId', currentSrc);
                //}
            }

            if (mediaSource) {

                state.PlayState.MediaSourceId = mediaSource.Id;

                state.NowPlayingItem = {
                    RunTimeTicks: mediaSource.RunTimeTicks
                };

                state.PlayState.CanSeek = (mediaSource.RunTimeTicks || 0) > 0 /*|| canPlayerSeek()*/;
            }

            if (item) {

                state.NowPlayingItem = getNowPlayingItemForReporting(item, mediaSource);
            }

            return state;
        }

        function getCurrentTicks(player) {

            var playerTime = Math.floor(10000 * (player || currentPlayer).currentTime());

            //playerTime += self.startTimeTicksOffset;

            return playerTime;
        };

        function getNowPlayingItemForReporting(item, mediaSource) {

            var nowPlayingItem = {};

            nowPlayingItem.RunTimeTicks = mediaSource.RunTimeTicks;

            nowPlayingItem.Id = item.Id;
            nowPlayingItem.MediaType = item.MediaType;
            nowPlayingItem.Type = item.Type;
            nowPlayingItem.Name = item.Name;

            nowPlayingItem.IndexNumber = item.IndexNumber;
            nowPlayingItem.IndexNumberEnd = item.IndexNumberEnd;
            nowPlayingItem.ParentIndexNumber = item.ParentIndexNumber;
            nowPlayingItem.ProductionYear = item.ProductionYear;
            nowPlayingItem.PremiereDate = item.PremiereDate;
            nowPlayingItem.SeriesName = item.SeriesName;
            nowPlayingItem.Album = item.Album;
            nowPlayingItem.Artists = item.Artists;

            var imageTags = item.ImageTags || {};

            if (item.SeriesPrimaryImageTag) {

                nowPlayingItem.PrimaryImageItemId = item.SeriesId;
                nowPlayingItem.PrimaryImageTag = item.SeriesPrimaryImageTag;
            }
            else if (imageTags.Primary) {

                nowPlayingItem.PrimaryImageItemId = item.Id;
                nowPlayingItem.PrimaryImageTag = imageTags.Primary;
            }
            else if (item.AlbumPrimaryImageTag) {

                nowPlayingItem.PrimaryImageItemId = item.AlbumId;
                nowPlayingItem.PrimaryImageTag = item.AlbumPrimaryImageTag;
            }
            else if (item.SeriesPrimaryImageTag) {

                nowPlayingItem.PrimaryImageItemId = item.SeriesId;
                nowPlayingItem.PrimaryImageTag = item.SeriesPrimaryImageTag;
            }

            if (item.BackdropImageTags && item.BackdropImageTags.length) {

                nowPlayingItem.BackdropItemId = item.Id;
                nowPlayingItem.BackdropImageTag = item.BackdropImageTags[0];
            }
            else if (item.ParentBackdropImageTags && item.ParentBackdropImageTags.length) {
                nowPlayingItem.BackdropItemId = item.ParentBackdropItemId;
                nowPlayingItem.BackdropImageTag = item.ParentBackdropImageTags[0];
            }

            if (imageTags.Thumb) {

                nowPlayingItem.ThumbItemId = item.Id;
                nowPlayingItem.ThumbImageTag = imageTags.Thumb;
            }

            if (imageTags.Logo) {

                nowPlayingItem.LogoItemId = item.Id;
                nowPlayingItem.LogoImageTag = imageTags.Logo;
            }
            else if (item.ParentLogoImageTag) {

                nowPlayingItem.LogoItemId = item.ParentLogoItemId;
                nowPlayingItem.LogoImageTag = item.ParentLogoImageTag;
            }

            return nowPlayingItem;
        }

        function validatePlayback(fn) {

            fn();

            //requirejs(["scripts/registrationservices"], function () {
            //    RegistrationServices.validateFeature('playback').done(fn);
            //});
        }

        function playItems(options, method) {

            require(['loading'], function (loading) {
                loading.show();
            });

            if (options.items) {

                translateItemsForPlayback(options.items).then(function (items) {

                    playWithIntros(items, options);
                });

            } else {

                getItemsForPlayback({

                    Ids: options.ids.join(',')

                }).then(function (result) {

                    translateItemsForPlayback(result.Items).then(function (items) {

                        playWithIntros(items, options);
                    });

                });
            }
        }

        function translateItemsForPlayback(items) {

            return new Promise(function (resolve, reject) {

                var firstItem = items[0];
                var promise;

                if (firstItem.Type == "Playlist") {

                    promise = getItemsForPlayback({
                        ParentId: firstItem.Id,
                    });
                }
                else if (firstItem.Type == "MusicArtist") {

                    promise = getItemsForPlayback({
                        ArtistIds: firstItem.Id,
                        Filters: "IsNotFolder",
                        Recursive: true,
                        SortBy: "SortName",
                        MediaTypes: "Audio"
                    });

                }
                else if (firstItem.Type == "MusicGenre") {

                    promise = getItemsForPlayback({
                        Genres: firstItem.Name,
                        Filters: "IsNotFolder",
                        Recursive: true,
                        SortBy: "SortName",
                        MediaTypes: "Audio"
                    });
                }
                else if (firstItem.IsFolder) {

                    promise = getItemsForPlayback({
                        ParentId: firstItem.Id,
                        Filters: "IsNotFolder",
                        Recursive: true,
                        SortBy: "SortName",
                        MediaTypes: "Audio,Video"
                    });
                }

                if (promise) {
                    promise.then(function (result) {

                        resolve(result.Items);

                    }, reject);
                } else {
                    resolve(items);
                }
            });
        }

        function playWithIntros(items, options, user) {

            var firstItem = items[0];

            if (firstItem.MediaType === "Video") {

                //Dashboard.showModalLoadingMsg();
            }

            var afterPlayInternal = function () {
                setPlaylistState(0, items);
                require(['loading'], function (loading) {
                    loading.hide();
                });
            };

            if (options.startPositionTicks || firstItem.MediaType !== 'Video') {

                playInternal(firstItem, options.startPositionTicks, afterPlayInternal);
                return;
            }

            Emby.Models.intros(firstItem.Id).then(function (intros) {

                items = intros.Items.concat(items);
                playInternal(items[0], options.startPositionTicks, afterPlayInternal);
            });
        }

        // Set currentPlaylistIndex and playlist. Using a method allows for overloading in derived player implementations
        function setPlaylistState(i, items) {
            if (!isNaN(i)) {
                currentPlaylistIndex = i;
            }
            if (items) {
                self.playlist = items;
            }
        }

        function playInternal(item, startPosition, callback) {

            if (item.IsPlaceHolder) {
                require(['loading'], function (loading) {
                    loading.hide();
                    showPlaybackInfoErrorMessage('PlaceHolder');
                });
                return;
            }

            if (currentPlayer) {
                currentPlayer.stop(false);
            }

            require(['appsettings', 'connectionManager'], function (appSettings, connectionManager) {

                var apiClient = connectionManager.getApiClient(item.ServerId);

                if (item.MediaType == 'Video' && appSettings.enableAutomaticBitrateDetection() && (new Date().getTime() - lastBitrateDetect) > 300000) {

                    apiClient.detectBitrate().done(function (bitrate) {

                        Logger.log('Max bitrate auto detected to ' + bitrate);
                        lastBitrateDetect = new Date().getTime();
                        appSettings.maxStreamingBitrate(bitrate);

                        playAfterBitrateDetect(apiClient, item, startPosition, callback);

                    }).fail(function () {

                        playAfterBitrateDetect(apiClient, item, startPosition, callback);
                    });

                } else {
                    playAfterBitrateDetect(apiClient, item, startPosition, callback);
                }
            });
        }

        function playAfterBitrateDetect(apiClient, item, startPosition, callback) {

            var player = getPlayer(item);
            var deviceProfile = player.getDeviceProfile();

            tryStartPlayback(apiClient, deviceProfile, item, startPosition, function (mediaSource) {

                createStreamInfo(apiClient, item.MediaType, item, mediaSource, startPosition).then(function (streamInfo) {

                    currentItem = item;
                    currentMediaSource = mediaSource;

                    streamInfo.item = item;
                    streamInfo.mediaSource = mediaSource;

                    player.play(streamInfo).then(callback);
                    currentPlayer = player;

                });
            });
        }

        function createStreamInfo(apiClient, type, item, mediaSource, startPosition) {

            return new Promise(function (resolve, reject) {

                var mediaUrl;
                var contentType;
                var transcodingOffsetTicks = 0;
                var playerStartPositionTicks = startPosition;

                var playMethod = 'Transcode';

                if (type == 'Video') {

                    contentType = 'video/' + mediaSource.Container;

                    if (mediaSource.enableDirectPlay) {
                        mediaUrl = mediaSource.Path;

                        playMethod = 'DirectPlay';

                    } else {

                        if (mediaSource.SupportsDirectStream) {

                            var directOptions = {
                                Static: true,
                                mediaSourceId: mediaSource.Id,
                                deviceId: apiClient.deviceId(),
                                api_key: apiClient.accessToken()
                            };

                            if (mediaSource.LiveStreamId) {
                                directOptions.LiveStreamId = mediaSource.LiveStreamId;
                            }

                            mediaUrl = apiClient.getUrl('Videos/' + item.Id + '/stream.' + mediaSource.Container, directOptions);

                            playMethod = 'DirectStream';
                        } else if (mediaSource.SupportsTranscoding) {

                            mediaUrl = apiClient.getUrl(mediaSource.TranscodingUrl);

                            if (mediaSource.TranscodingSubProtocol == 'hls') {

                                contentType = 'application/x-mpegURL';
                            } else {

                                transcodingOffsetTicks = startPosition || 0;
                                playerStartPositionTicks = null;
                                contentType = 'video/' + mediaSource.TranscodingContainer;
                            }
                        }
                    }

                } else {

                    contentType = 'audio/' + mediaSource.Container;

                    if (mediaSource.enableDirectPlay) {

                        mediaUrl = mediaSource.Path;

                        playMethod = 'DirectPlay';

                    } else {

                        var isDirectStream = mediaSource.SupportsDirectStream;

                        if (isDirectStream) {

                            var outputContainer = (mediaSource.Container || '').toLowerCase();

                            var directOptions = {
                                Static: true,
                                mediaSourceId: mediaSource.Id,
                                deviceId: apiClient.deviceId(),
                                api_key: apiClient.accessToken()
                            };

                            if (mediaSource.LiveStreamId) {
                                directOptions.LiveStreamId = mediaSource.LiveStreamId;
                            }

                            mediaUrl = apiClient.getUrl('Audio/' + item.Id + '/stream.' + outputContainer, directOptions);

                            playMethod = 'DirectStream';

                        } else if (mediaSource.SupportsTranscoding) {

                            mediaUrl = apiClient.getUrl(mediaSource.TranscodingUrl);

                            if (mediaSource.TranscodingSubProtocol == 'hls') {

                                contentType = 'application/x-mpegURL';
                            } else {

                                transcodingOffsetTicks = startPosition || 0;
                                playerStartPositionTicks = null;
                                contentType = 'audio/' + mediaSource.TranscodingContainer;
                            }
                        }
                    }
                }

                var resultInfo = {
                    url: mediaUrl,
                    mimeType: contentType,
                    transcodingOffsetTicks: transcodingOffsetTicks,
                    playMethod: playMethod,
                    playerStartPositionTicks: playerStartPositionTicks
                };

                resolve(resultInfo);
            });
        }

        function tryStartPlayback(apiClient, deviceProfile, item, startPosition, callback) {

            if (item.MediaType === "Video") {

                //Dashboard.showModalLoadingMsg();
            }

            getPlaybackInfo(apiClient, item.Id, deviceProfile, startPosition).then(function (playbackInfoResult) {

                if (validatePlaybackInfoResult(playbackInfoResult)) {

                    getOptimalMediaSource(apiClient, item.MediaType, playbackInfoResult.MediaSources).then(function (mediaSource) {
                        if (mediaSource) {

                            if (mediaSource.RequiresOpening) {

                                getLiveStream(apiClient, item.Id, playbackInfoResult.PlaySessionId, deviceProfile, startPosition, mediaSource, null, null).then(function (openLiveStreamResult) {

                                    supportsDirectPlay(apiClient, openLiveStreamResult.MediaSource).then(function (result) {

                                        openLiveStreamResult.MediaSource.enableDirectPlay = result;
                                        callback(openLiveStreamResult.MediaSource);
                                    });

                                });

                            } else {
                                callback(mediaSource);
                            }
                        } else {
                            //Dashboard.hideModalLoadingMsg();
                            showPlaybackInfoErrorMessage('NoCompatibleStream');
                        }
                    });
                }
            });
        }

        function getPlaybackInfo(apiClient, itemId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId) {

            return new Promise(function (resolve, reject) {

                getPlaybackInfoInternal(apiClient, itemId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId).then(resolve, reject);
            });
        }

        function getPlaybackInfoInternal(apiClient, itemId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId) {

            var postData = {
                DeviceProfile: deviceProfile
            };

            var query = {
                UserId: apiClient.getCurrentUserId(),
                StartTimeTicks: startPosition || 0
            };

            if (audioStreamIndex != null) {
                query.AudioStreamIndex = audioStreamIndex;
            }
            if (subtitleStreamIndex != null) {
                query.SubtitleStreamIndex = subtitleStreamIndex;
            }
            if (mediaSource) {
                query.MediaSourceId = mediaSource.Id;
            }
            if (liveStreamId) {
                query.LiveStreamId = liveStreamId;
            }

            return apiClient.ajax({
                url: apiClient.getUrl('Items/' + itemId + '/PlaybackInfo', query),
                type: 'POST',
                data: JSON.stringify(postData),
                contentType: "application/json",
                dataType: "json"

            });
        }

        function getOptimalMediaSource(apiClient, mediaType, versions) {

            return new Promise(function (resolve, reject) {

                var promises = versions.map(function (v) {
                    return supportsDirectPlay(apiClient, v);
                });

                Promise.all(promises).then(function (results) {

                    for (var i = 0, length = versions.length; i < length; i++) {
                        versions[i].enableDirectPlay = results[i] || false;
                    }
                    var optimalVersion = versions.filter(function (v) {

                        return v.enableDirectPlay;

                    })[0];

                    if (!optimalVersion) {
                        optimalVersion = versions.filter(function (v) {

                            return v.SupportsDirectStream;

                        })[0];
                    }

                    optimalVersion = optimalVersion || versions.filter(function (s) {
                        return s.SupportsTranscoding;
                    })[0];

                    resolve(optimalVersion);

                }, reject);
            });
        }

        function getLiveStream(apiClient, itemId, playSessionId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex) {

            return new Promise(function (resolve, reject) {

                var postData = {
                    DeviceProfile: deviceProfile,
                    OpenToken: mediaSource.OpenToken
                };

                var query = {
                    UserId: apiClient.getCurrentUserId(),
                    StartTimeTicks: startPosition || 0,
                    ItemId: itemId,
                    PlaySessionId: playSessionId
                };

                if (audioStreamIndex != null) {
                    query.AudioStreamIndex = audioStreamIndex;
                }
                if (subtitleStreamIndex != null) {
                    query.SubtitleStreamIndex = subtitleStreamIndex;
                }

                apiClient.ajax({
                    url: apiClient.getUrl('LiveStreams/Open', query),
                    type: 'POST',
                    data: JSON.stringify(postData),
                    contentType: "application/json",
                    dataType: "json"

                }).then(resolve, reject);
            });
        };

        function supportsDirectPlay(apiClient, mediaSource) {

            return new Promise(function (resolve, reject) {

                if (mediaSource.SupportsDirectPlay) {

                    if (mediaSource.Protocol == 'Http' && !mediaSource.RequiredHttpHeaders.length) {

                        // If this is the only way it can be played, then allow it
                        if (!mediaSource.SupportsDirectStream && !mediaSource.SupportsTranscoding) {
                            resolve(true);
                        }
                        else {
                            var val = mediaSource.Path.toLowerCase().replace('https:', 'http').indexOf(apiClient.serverAddress().toLowerCase().replace('https:', 'http').substring(0, 14)) == 0;
                            resolve(val);
                        }
                    }

                    if (mediaSource.Protocol == 'File') {

                        // TODO
                        resolve(false);
                    }
                }
                else {
                    resolve(false);
                }
            });
        };

        function validatePlaybackInfoResult(result) {

            if (result.ErrorCode) {

                showPlaybackInfoErrorMessage(result.ErrorCode);
                return false;
            }

            return true;
        }

        function getPlayer(item) {

            return self.getPlayers().filter(function (p) {

                return p.canPlayMediaType(item.MediaType);

            })[0];
        }

        function getItemsForPlayback(query) {

            return new Promise(function (resolve, reject) {

                if (query.Ids && query.Ids.split(',').length == 1) {

                    Emby.Models.item(query.Ids.split(',')).then(function (item) {

                        resolve({
                            Items: [item],
                            TotalRecordCount: 1
                        });

                    }, reject);
                }
                else {

                    query.Limit = query.Limit || 100;
                    query.Fields = "MediaSources,Chapters";
                    query.ExcludeLocationTypes = "Virtual";

                    Emby.Models.items(query).then(resolve, reject);
                }
            });
        };

        // Gets or sets the current playlist index
        self.currentPlaylistIndex = function (i) {

            if (i == null) {
                return currentPlaylistIndex;
            }

            var newItem = self.playlist[i];

            playInternal(newItem, 0, function () {
                self.setPlaylistState(i);
            });
        };

        self.getRepeatMode = function () {
            return 'RepeatNone';
        };

        self.nextTrack = function () {

            var newIndex;

            switch (self.getRepeatMode()) {

                case 'RepeatOne':
                    newIndex = currentPlaylistIndex;
                    break;
                case 'RepeatAll':
                    newIndex = currentPlaylistIndex + 1;
                    if (newIndex >= self.playlist.length) {
                        newIndex = 0;
                    }
                    break;
                default:
                    newIndex = currentPlaylistIndex + 1;
                    break;
            }

            var newItem = self.playlist[newIndex];

            if (newItem) {

                Logger.log('playing next track');

                playInternal(newItem, 0, function () {
                    setPlaylistState(newIndex);
                });
            }
        };

        self.previousTrack = function () {
            var newIndex = currentPlaylistIndex - 1;
            if (newIndex >= 0) {
                var newItem = self.playlist[newIndex];

                if (newItem) {
                    playInternal(newItem, 0, function () {
                        setPlaylistState(newIndex);
                    });
                }
            }
        };

        self.queue = function (options) {

            if (typeof (options) === 'string') {
                options = { ids: [options] };
            }

            if (currentPlayer) {
                //currentPlayer.queue(options);
            } else {
                self.play(options);
            }
        };

        self.queueNext = function (options) {

            if (typeof (options) === 'string') {
                options = { ids: [options] };
            }

            if (currentPlayer) {
                //currentPlayer.queueNext(options);
            } else {
                self.play(options);
            }
        };

        function onPlaybackStart() {
            Events.trigger(self, 'playbackstart', [this]);
        }

        function onPlaybackStop() {
            Events.trigger(self, 'playbackstop', [this]);
        }

        Events.on(Emby.PluginManager, 'registered', function (e, plugin) {

            if (plugin.type == 'mediaplayer') {
                Events.on(plugin, 'playbackstart', onPlaybackStart);
                Events.on(plugin, 'playbackstop', onPlaybackStop);
            }
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PlaybackManager = new playbackManager();

})(this);
