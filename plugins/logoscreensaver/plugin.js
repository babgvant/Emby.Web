(function () {

    function theme() {

        var self = this;

        self.name = 'Logo ScreenSaver';
        self.type = 'screensaver';
        self.packageName = 'logoscreensaver';
        self.supportsAnonymous = true;

        self.getDependencies = function () {

            var files = [
            ];

            return files;
        };

        self.show = function () {

        };

        self.hide = function () {

        };
    }

    Emby.PluginManager.register(new theme());

})();