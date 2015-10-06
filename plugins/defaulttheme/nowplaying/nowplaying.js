(function () {

    document.addEventListener("viewinit-defaulttheme-nowplaying", function (e) {

        new nowPlayingPage(e.detail.element, e.detail.params);
    });

    function nowPlayingPage(view, params) {

        var self = this;
        var currentPlayer;

        var nowPlayingVolumeSlider = view.querySelector('.nowPlayingVolumeSlider');
        var nowPlayingPositionSlider = view.querySelector('.nowPlayingPositionSlider');

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

            } else {
                view.querySelector('.nowPlayingProgressContainer').classList.add('hide');
                view.querySelector('.nowPlayingButtonsContainer').classList.add('hide');
                view.querySelector('.nowPlayingCardContainer').innerHTML = '';
                view.querySelector('.nowPlayingMetadata').innerHTML = '';

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
            currentPlayer = player;
            updateVolume(player);
            updateTime(player);
            updatePlaystate(player);
            Events.on(player, 'volumechange', onVolumeChange);
            Events.on(player, 'timeupdate', onTimeUpdate);
            Events.on(player, 'pause', onPlaystateChange);
            Events.on(player, 'playing', onPlaystateChange);
        }

        function releasePlayer(player) {
            Events.off(player, 'volumechange', onVolumeChange);
            Events.off(player, 'timeupdate', onTimeUpdate);
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

            if (player.paused()) {
                view.querySelector('.btnUnpause').classList.remove('hide');
                view.querySelector('.btnPause').classList.add('hide');
            } else {
                view.querySelector('.btnUnpause').classList.add('hide');
                view.querySelector('.btnPause').classList.remove('hide');
            }
        }

        function updateVolume(player) {

            if (!nowPlayingVolumeSlider.dragging) {
                nowPlayingVolumeSlider.value = player.volume();
            }

            if (player.isMuted()) {
                view.querySelector('.buttonMute').classList.add('hide');
                view.querySelector('.buttonUnmute').classList.remove('hide');
            } else {
                view.querySelector('.buttonMute').classList.remove('hide');
                view.querySelector('.buttonUnmute').classList.add('hide');
            }
        }

        function updateTime(player) {

            if (!nowPlayingPositionSlider.dragging) {

                return;
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

            onPlaybackStart(e, Emby.PlaybackManager.currentPlayer());
        });

        view.addEventListener('viewdestroy', function () {

            if (currentPlayer) {
                releasePlayer(currentPlayer);
            }

            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
            nowPlayingVolumeSlider = null;
        });

        view.querySelector('.buttonMute').addEventListener('click', function () {

            Emby.PlaybackManager.setMute(true);
        });

        view.querySelector('.buttonUnmute').addEventListener('click', function () {

            Emby.PlaybackManager.setMute(false);
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

        view.querySelector('.btnUnpause').addEventListener('click', function () {

            Emby.PlaybackManager.unpause();
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            Emby.PlaybackManager.pause();
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
    }

})();