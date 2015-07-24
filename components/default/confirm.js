define([], function () {
    return function (options) {
        var result = confirm(options.text);

        if (options.callback) {
            options.callback(result);
        }
    };
});