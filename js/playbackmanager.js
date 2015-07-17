(function (globalScope, document) {

	function isPlayingVideo() {
		return false;
	}

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PlaybackManager = {
        isPlayingVideo: isPlayingVideo
    };

})(this, document);
