/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Lu�s Almeida
 * https://github.com/luis-almeida
 */

(function (globalScope) {

    var unveilId = 0;

    var thresholdX = screen.availWidth;
    var thresholdY = screen.availHeight;

    function isVisible(elem) {
        return Emby.Dom.visibleInViewport(elem, true, thresholdX, thresholdY);
    }

    function fillImage(elem) {
        var source = elem.getAttribute('data-src');
        if (source) {
            ImageStore.setImageInto(elem, source);
            elem.setAttribute("data-src", '');
        }
    }

    function unveilElements(elems) {

        if (!elems.length) {
            return;
        }

        var images = elems;

        unveilId++;
        var eventNamespace = 'unveil' + unveilId;

        function unveil() {

            var remaining = [];

            for (var i = 0, length = images.length; i < length; i++) {
                var img = images[i];
                if (isVisible(img)) {
                    fillImage(img);
                } else {
                    remaining.push(img);
                }
            }

            images = remaining;

            if (!images.length) {
                Events.off(document, 'scroll.' + eventNamespace);
                Events.off(window, 'resize.' + eventNamespace);
            }
        }

        Events.on(document, 'scroll.' + eventNamespace, unveil);
        Events.on(window, 'resize.' + eventNamespace, unveil);

        unveil();
    }

    function fillImages(elems) {

        for (var i = 0, length = elems.length; i < length; i++) {
            var elem = elems[0];
            var source = elem.getAttribute('data-src');
            if (source) {
                ImageStore.setImageInto(elem, source);
                elem.setAttribute("data-src", '');
            }
        }
    }

    function lazyChildren(elem) {

        unveilElements(elem.getElementsByClassName('lazy'));
    }

    function lazyImage(elem, url) {

        elem.setAttribute('data-src', url);
        fillImages([elem]);
    }

    function getPrimaryImageAspectRatio(items) {

        var values = [];

        for (var i = 0, length = items.length; i < length; i++) {

            var ratio = items[i].PrimaryImageAspectRatio || 0;

            if (!ratio) {
                continue;
            }

            values[values.length] = ratio;
        }

        if (!values.length) {
            return null;
        }

        // Use the median
        values.sort(function (a, b) { return a - b; });

        var half = Math.floor(values.length / 2);

        var result;

        if (values.length % 2)
            result = values[half];
        else
            result = (values[half - 1] + values[half]) / 2.0;

        // If really close to 2:3 (poster image), just return 2:3
        if (Math.abs(0.66666666667 - result) <= .15) {
            return 0.66666666667;
        }

        // If really close to 16:9 (episode image), just return 16:9
        if (Math.abs(1.777777778 - result) <= .2) {
            return 1.777777778;
        }

        // If really close to 1 (square image), just return 1
        if (Math.abs(1 - result) <= .15) {
            return 1;
        }

        // If really close to 4:3 (poster image), just return 2:3
        if (Math.abs(1.33333333333 - result) <= .15) {
            return 1.33333333333;
        }

        return result;
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ImageLoader = {
        lazyChildren: lazyChildren,
        getPrimaryImageAspectRatio: getPrimaryImageAspectRatio
    };

})(this);

(function () {

    function setImageIntoElement(elem, url) {

        if (elem.tagName !== "IMG") {

            elem.style.backgroundImage = "url('" + url + "')";

        } else {
            elem.setAttribute("src", url);
        }
    }

    function simpleImageStore() {

        var self = this;

        self.setImageInto = setImageIntoElement;
    }

    console.log('creating simpleImageStore');
    window.ImageStore = new simpleImageStore();

})();