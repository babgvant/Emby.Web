define([], function () {

    function audioManager() {

        var self = this;

        self.playSoundEffect = function (options) {
            require(['soundeffect'], function (soundEffects) {

                if (soundEffects.isSupported()) {
                    soundEffects.play(options);
                }
            });
        };
    }

    return new audioManager();
});