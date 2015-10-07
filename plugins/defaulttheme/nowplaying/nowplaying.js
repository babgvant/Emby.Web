(function () {

    document.addEventListener("viewinit-defaulttheme-nowplaying", function (e) {

        new nowPlayingPage(e.detail.element, e.detail.params);
    });

    function nowPlayingPage(view, params) {

        var self = this;
        var currentPlayer;

        var nowPlayingVolumeSlider = view.querySelector('.nowPlayingVolumeSlider');
        var nowPlayingPositionSlider = view.querySelector('.nowPlayingPositionSlider');
        var btnRepeat = view.querySelector('.btnRepeat');

        function setCurrentItem(item) {

            if (item) {
                Emby.Backdrop.setBackdrops([item]);

                view.querySelector('.nowPlayingProgressContainer').classList.remove('hide');
                view.querySelector('.nowPlayingButtonsContainer').classList.remove('hide');

                DefaultTheme.CardBuilder.buildCards([item], {
                    shape: 'squareCard',
                    width: 640,
                    itemsContainer: view.querySelector('.nowPlayingCardContainer')
                });

                var names = [];

                names.push(item.Name);

                if (item.ArtistItems && item.ArtistItems[0]) {
                    names.push(item.ArtistItems[0].Name);
                }

                if (item.Album) {
                    names.push(item.Album);
                }

                view.querySelector('.nowPlayingMetadata').innerHTML = names.join('<br/>');
                view.querySelector('.userDataIcons').innerHTML = DefaultTheme.UserData.getIconsHtml(item, false);

            } else {
                view.querySelector('.nowPlayingProgressContainer').classList.add('hide');
                view.querySelector('.nowPlayingButtonsContainer').classList.add('hide');
                view.querySelector('.nowPlayingCardContainer').innerHTML = '';
                view.querySelector('.nowPlayingMetadata').innerHTML = '';
                view.querySelector('.userDataIcons').innerHTML = '';

                Emby.Backdrop.clear();
            }
        }

        function onPlaybackStart(e, player) {

            bindToPlayer(player);
            setCurrentItem(Emby.PlaybackManager.currentItem());
        }

        function onPlaybackStop(e, player) {
            releasePlayer(player);
            setCurrentItem(null);
        }

        function bindToPlayer(player) {

            if (player != currentPlayer) {

                if (currentPlayer) {
                    releasePlayer(currentPlayer);
                }

                Events.on(player, 'volumechange', onVolumeChange);
                Events.on(player, 'playbackprogress', onTimeUpdate);
                Events.on(player, 'pause', onPlaystateChange);
                Events.on(player, 'playing', onPlaystateChange);
            }

            currentPlayer = player;
            updateVolume(player);
            updateTime(player);
            updatePlaystate(player);
        }

        function releasePlayer(player) {
            Events.off(player, 'volumechange', onVolumeChange);
            Events.off(player, 'playbackprogress', onTimeUpdate);
            Events.off(player, 'pause', onPlaystateChange);
            Events.off(player, 'playing', onPlaystateChange);
        }

        function onTimeUpdate(e) {
            updateTime(this);
        }

        function onVolumeChange(e) {
            updateVolume(this);
        }

        function onPlaystateChange(e) {
            updatePlaystate(this);
        }

        function updatePlaystate(player) {

            if (Emby.PlaybackManager.paused()) {
                view.querySelector('.btnPause').icon = 'play-arrow';
            } else {
                view.querySelector('.btnPause').icon = 'pause';
            }

            var repeatMode = Emby.PlaybackManager.getRepeatMode();

            if (repeatMode == 'RepeatAll') {
                btnRepeat.icon = "repeat";
                btnRepeat.classList.add('repeatActive');
            }
            else if (repeatMode == 'RepeatOne') {
                btnRepeat.icon = "repeat-one";
                btnRepeat.classList.add('repeatActive');
            } else {
                btnRepeat.icon = "repeat";
                btnRepeat.classList.remove('repeatActive');
            }
        }

        function onRepeatModeChanged() {
            updatePlaystate(currentPlayer);
        }

        function updateVolume(player) {

            if (!nowPlayingVolumeSlider.dragging) {
                nowPlayingVolumeSlider.value = Emby.PlaybackManager.volume();
            }

            if (Emby.PlaybackManager.isMuted()) {
                view.querySelector('.buttonMute').icon = 'volume-off';
            } else {
                view.querySelector('.buttonMute').icon = 'volume-up';
            }
        }

        function updateTime(player) {

            if (!nowPlayingPositionSlider.dragging) {

                var state = Emby.PlaybackManager.getPlayerState();
                var playState = state.PlayState || {};
                var nowPlayingItem = state.NowPlayingItem || {};

                if (nowPlayingItem.RunTimeTicks) {

                    var pct = playState.PositionTicks / nowPlayingItem.RunTimeTicks;
                    pct *= 100;

                    nowPlayingPositionSlider.value = pct;

                } else {

                    nowPlayingPositionSlider.value = 0;
                }

                nowPlayingPositionSlider.disabled = !playState.CanSeek;
            }
        }

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle('');
            Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
            Events.on(Emby.PlaybackManager, 'repeatmodechange', onRepeatModeChanged);

            onPlaybackStart(e, Emby.PlaybackManager.currentPlayer());
        });

        view.addEventListener('viewhide', function () {

            if (currentPlayer) {
                releasePlayer(currentPlayer);
            }

            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
            Events.off(Emby.PlaybackManager, 'repeatmodechange', onRepeatModeChanged);
        });

        view.querySelector('.buttonMute').addEventListener('click', function () {

            Emby.PlaybackManager.toggleMute();
        });

        nowPlayingVolumeSlider.addEventListener('change', function () {

            Emby.PlaybackManager.volume(this.value);
        });

        nowPlayingPositionSlider.addEventListener('change', function () {

            Emby.PlaybackManager.seekPercent(parseFloat(this.value));
        });

        view.querySelector('.btnPreviousTrack').addEventListener('click', function () {

            Emby.PlaybackManager.previousTrack();
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            Emby.PlaybackManager.playPause();
        });

        view.querySelector('.btnStop').addEventListener('click', function () {

            Emby.PlaybackManager.stop();
        });

        view.querySelector('.btnNextTrack').addEventListener('click', function () {

            Emby.PlaybackManager.nextTrack();
        });

        view.querySelector('.btnPlaylist').addEventListener('click', function () {

            Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'nowplaying/playlist.html'));
        });

        btnRepeat.addEventListener('click', function () {

            switch (Emby.PlaybackManager.getRepeatMode()) {
                case 'RepeatAll':
                    Emby.PlaybackManager.setRepeatMode('RepeatOne');
                    break;
                case 'RepeatOne':
                    Emby.PlaybackManager.setRepeatMode('RepeatNone');
                    break;
                default:
                    Emby.PlaybackManager.setRepeatMode('RepeatAll');
                    break;
            }
        });
    }

})();