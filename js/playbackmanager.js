(function (globalScope) {

    function playbackManager() {

        var self = this;
        var activePlayer;

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

            if (activePlayer) {
                return activePlayer.isMuted();
            }

            return false;
        };

        self.setMute = function (mute) {

            if (activePlayer) {
                activePlayer.setMute(mute);
            }
        };

        self.getVolume = function () {

            if (activePlayer) {
                return activePlayer.getVolume();
            }

            return 0;
        };

        self.setVolume = function (volume) {

            if (activePlayer) {
                activePlayer.setVolume(volume);
            }
        };

        self.volumeUp = function () {

            if (activePlayer) {
                activePlayer.volumeUp();
            }
        };

        self.volumeDown = function () {

            if (activePlayer) {
                activePlayer.volumeDown();
            }
        };

        self.setAudioStreamIndex = function (index) {

            if (activePlayer) {
                activePlayer.setAudioStreamIndex(index);
            }
        };

        self.setSubtitleStreamIndex = function (index) {

            if (activePlayer) {
                activePlayer.setSubtitleStreamIndex(index);
            }
        };

        self.stopAll = function () {

        };

        self.play = function () {

        };

        self.playTrailer = function (item) {

        };
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PlaybackManager = new playbackManager();

})(this);
