(function (globalScope) {

    function playbackManager() {

        var self = this;
        var lastBitrateDetect = 0;
        var currentPlayer;
        var currentItem;
        var currentMediaSource;

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

        self.getVolume = function () {

            if (currentPlayer) {
                return currentPlayer.getVolume();
            }

            return 0;
        };

        self.setVolume = function (volume) {

            if (currentPlayer) {
                currentPlayer.setVolume(volume);
            }
        };

        self.volumeUp = function () {

            if (currentPlayer) {
                currentPlayer.volumeUp();
            }
        };

        self.volumeDown = function () {

            if (activePlayer) {
                activePlayer.volumeDown();
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

        self.stopAll = function () {

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
            validatePlayback(function () {
                playItems({
                    ids: id
                }, 'InstantMix');
            });
        };

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

            if (options.startPositionTicks || firstItem.MediaType !== 'Video') {

                playInternal(firstItem, options.startPositionTicks, function () { });
                return;
            }

            Emby.Models.intros(firstItem.Id).then(function (intros) {

                items = intros.Items.concat(items);
                playInternal(items[0], options.startPositionTicks, function () { });
            });
        }

        function playInternal(item, startPosition, callback) {

            if (item.IsPlaceHolder) {
                require(['loading'], function (loading) {
                    loading.hide();
                    showPlaybackInfoErrorMessage('PlaceHolder');
                });
                return;
            }

            if (currentPlayer && currentPlayer.isPlaying()) {
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

                currentItem = item;
                currentMediaSource = mediaSource;

                player.play(item, mediaSource, startPosition, callback);
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
                    UserId: Dashboard.getCurrentUserId(),
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
                    query.Fields = getItemFields;
                    query.ExcludeLocationTypes = "Virtual";

                    Emby.Models.items(query).then(resolve, reject);
                }
            });
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
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PlaybackManager = new playbackManager();

})(this);
