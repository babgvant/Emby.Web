define([], function () {

    function onChange() {
        // Create a scroll event so that the lazy image loading knows the document is scrolling
        document.dispatchEvent(new CustomEvent("scroll", {}));
    }

    return {
        create: function (element, options) {

            return new Promise(function (resolve, reject) {

                require(['bower_components/sly/src/sly'], function () {

                    var sly = new Sly(element, options);

                    // Add more items when close to the end
                    sly.on('load change', onChange);

                    resolve(sly);
                });
            });
        }
    };
});