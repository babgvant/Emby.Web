(function (globalScope) {

    function getDictionary() {

        return {};
    }

    function translate(key) {

        var val = getDictionary()[key] || key;

        for (var i = 1; i < arguments.length; i++) {

            val = val.replace('{' + (i - 1) + '}', arguments[i]);

        }

        return val;
    }

    function translateHtml(html) {

        return html;
    }

    globalScope.Globalize = {
        translate: translate,
        translateHtml: translateHtml
    };

})(this, document);
