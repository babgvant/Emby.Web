define([], function () {

    function getMinIdleTime() {
        // Returns the minimum amount of idle time required before the screen saver can be displayed
        return 60000;
    }

    function ScreenSaverManager() {

        var self = this;
        var activeScreenSaver;

        function showScreenSaver(screensaver) {

            Logger.log('Showing screensaver ' + screensaver.name);

            screensaver.show();
            activeScreenSaver = screensaver;

            if (screensaver.hideOnClick !== false) {
                document.addEventListener('click', hide);
            }
            if (screensaver.hideOnMouse !== false) {
                document.addEventListener('mousemove', hide);
            }
            if (screensaver.hideOnKey !== false) {
                document.addEventListener('keydown', hide);
            }
        }

        function hide() {
            if (activeScreenSaver) {
                Logger.log('Hiding screensaver');
                activeScreenSaver.hide();
                activeScreenSaver = null;
            }

            document.removeEventListener('click', hide);
            document.removeEventListener('mousemove', hide);
            document.removeEventListener('keydown', hide);
        }

        self.isShowing = function () {
            return activeScreenSaver != null;
        };

        self.show = function () {
            var screensavers = Emby.PluginManager.ofType('screensaver');

            require(['connectionManager'], function (connectionManager) {

                var server = connectionManager.currentLoggedInServer();

                screensavers = screensavers.filter(function (screensaver) {

                    if (!server) {
                        return screensaver.supportsAnonymous;
                    }

                    return true;
                });

                // Perform some other filter here to get the configured screensaver

                var current = screensavers.length ? screensavers[0] : null;
                if (current) {
                    showScreenSaver(current);
                }

            });
        };

        self.hide = function () {
            hide();
        };

        setInterval(function () {

            if (self.isShowing()) {
                return;
            }

            var minIdleTime = getMinIdleTime();

            if (minIdleTime > Emby.InputManager.idleTime()) {
                return;
            }

            if (Emby.PlaybackManager.isPlayingVideo()) {
                return;
            }

            self.show();

        }, 10000);
    }

    return new ScreenSaverManager();
});