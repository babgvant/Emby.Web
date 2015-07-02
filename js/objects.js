(function (globalScope) {

    function objectManager() {

        var self = this;
        var objects = [];

        // In lieu of automatic discovery, plugins will register dynamic objects
        // Each object will have the following properties:
        // name
        // type (theme, screensaver, etc)
        self.register = function (obj) {

            objects.push(obj);
        };

        self.ofType = function (type) {

            return objects.filter(function (o) {
                return o.type == type;
            });
        };

        self.objects = function () {
            return objects;
        };
    }

    globalScope.ObjectManager = new objectManager();

})(this);