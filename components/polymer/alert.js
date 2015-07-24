define([], function () {
    return function (options) {

        alert(options.text);

        if (options.callback) {
            options.callback();
        }
    };
});