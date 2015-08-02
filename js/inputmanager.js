(function (globalScope, document) {

    var lastInputTime = new Date().getTime();
    var lastMouseInputTime = new Date().getTime();
    var isMouseIdle;

    function idleTime() {
        return new Date().getTime() - lastInputTime;
    }

    function mouseIdleTime() {
        return new Date().getTime() - lastMouseInputTime;
    }

    document.addEventListener('click', function () {
        lastInputTime = new Date().getTime();
    });

    var lastMouseMoveData = {
        x: 0,
        y: 0
    };

    document.addEventListener('mousemove', function (e) {

        var obj = lastMouseMoveData;

        var eventX = e.screenX;
        var eventY = e.screenY;

        // if coord don't exist how could it move
        if (typeof eventX === "undefined" && typeof eventY === "undefined") {
            return;
        }

        // if coord are same, it didn't move
        if (Math.abs(eventX - obj.x) < 10 && Math.abs(eventY - obj.y) < 10) {
            return;
        }

        obj.x = eventX;
        obj.y = eventY;

        lastInputTime = lastMouseInputTime = new Date().getTime();

        if (isMouseIdle) {
            isMouseIdle = false;
            document.body.classList.remove('mouseIdle');
        }
    });

    document.addEventListener('keydown', function (evt) {
        lastInputTime = new Date().getTime();

        if (evt.keyCode == 13) {

            var tag = evt.target.tagName;

            if ((evt.target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA')) {

                var keyboard = getKeyboard();

                if (keyboard) {

                    keyboard.show(evt.target);
                    evt.stopPropagation();
                    evt.preventDefault();
                    return false;
                }
            }
        }

    });

    setInterval(function () {

        if (mouseIdleTime() >= 5000) {
            isMouseIdle = true;
            document.body.classList.add('mouseIdle');
        }

    }, 5000);

    function getKeyboard() {
        return Emby.PluginManager.ofType('keyboard')[0];
    }

    document.addEventListener('keydown', function (evt) {

    }, true);

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.InputManager = {
        idleTime: idleTime
    };

    // https://github.com/gilmoreorless/jquery-nearest

})(this, document);
