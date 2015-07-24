define([], function () {
    return function (options) {

        // default implementation will just go cheap and use alert
        require(['alert'], function (alert) {
            alert(options);
        });
    };
});