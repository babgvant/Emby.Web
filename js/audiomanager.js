(function (globalScope, document) {

    function playSoundEffect(options) {
        require(['soundeffect'], function (soundEffects) {

            if (soundEffects.isSupported()) {
                soundEffects.play(options);
            }
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.AudioManager = {
        playSoundEffect: playSoundEffect
    };

})(this, document);
