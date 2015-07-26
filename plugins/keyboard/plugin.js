(function () {

    function theme() {

        var self = this;

        self.name = 'Default Keyboard';
        self.type = 'keyboard';
        self.packageName = 'keyboard';

        self.getDependencies = function () {

            var files = [
                Emby.PluginManager.mapPath(self, 'keylime')
            ];

            return files;
        };

        function loadKeyLime() {

            return new Promise(function (resolve, reject) {

                if (window.keyLime) {
                    resolve();
                    return;
                }

                require([Emby.PluginManager.mapPath(self, 'keylime')], function () {
                    window.keyLime.config = window.keyLime.config || {};
                    window.keyLime.config.noauto = true;
                    resolve();
                });
            });

        }

        self.show = function (field) {

            loadKeyLime().then(function () {
                window.keyLime.show();
            });

        };
    }

    Emby.PluginManager.register(new theme());

})();