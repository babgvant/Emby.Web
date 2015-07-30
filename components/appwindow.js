define([], function () {

    return {
        getWindowState: function () {
            return document.windowState || 'Normal';
        },
        setWindowState: function (state) {

        },
        supports: function (command) {

            // Web-based implementation can't really do much
            return false;
        }
    };
});