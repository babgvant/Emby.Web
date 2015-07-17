(function (globalScope, document) {

    var activeScreenSaver;

    function isShowing() {
        return activeScreenSaver != null;
    }

    function show() {

        var screensavers = Emby.PluginManager.ofType('screensaver');

        require(['currentLoggedInServer'], function (server) {

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
    }

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

    function getMinIdleTime() {
        // Returns the minimum amount of idle time required before the screen saver can be displayed
        return 30000;
    }

    setInterval(function () {

        if (isShowing()) {
            return;
        }

        var minIdleTime = getMinIdleTime();

        if (minIdleTime > Emby.InputManager.idleTime()) {
            return;
        }

        if (Emby.PlaybackManager.isPlayingVideo()) {
            return;
        }

        show();

    }, 10000);

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ScreenSaverManager = {
        isShowing: isShowing,
        show: show,
        hide: hide
    };

})(this, document);
