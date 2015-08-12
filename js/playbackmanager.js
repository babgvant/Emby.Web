(function (globalScope) {

    function playbackManager() {

        var self = this;
        self.players = [];

        self.isPlayingVideo = function () {
            return false;
        };

        self.canPlay = function (item) {

        };

        self.isMuted = function () {

        };

        self.setMute = function (mute) {

        };

        self.getVolume = function () {

        };

        self.setVolume = function (volume) {

        };

        self.volumeUp = function () {

        };

        self.volumeDown = function () {

        };

        self.setAudioStreamIndex = function (index) {

        };

        self.setSubtitleStreamIndex = function (index) {

        };

        self.stopAll = function () {

        };

        self.getPlayers = function () {
            return players;
        };
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PlaybackManager = new playbackManager();

})(this);
