(function (document, window) {
    // Private
    var cache = {},
		contentEl = document.getElementById('content');

    var currentApiClient;

    function get(url, cb) {
        if (cache[url]) return cb(cache[url]);

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var data = request.responseText;
                cache[url] = data;
                cb(data);
            } else {
                // Server returned error
            }
        };
        request.onerror = function () {
            // Connection error
        };
        request.send();
    }

    function ctx(ctx, next) {
        ctx.data = {};
        ctx.partials = {};
        if (ctx.init) {
            next();
        } else {
            contentEl.classList.add('transition');
            setTimeout(function () {
                content.classList.remove('transition');
                next();
            }, 300);
        }
    }

    function authenticate(ctx, next) {
        if (currentApiClient && currentApiClient.getCurrentUserId()) {
            next();
            return;
        }

        if (ctx.pathname !== 'login')
            page.redirect('login');
        else
            next();
    }

    var importedCss = [];
    function loadCss(url) {

        if (importedCss.indexOf(url) != -1) {
            return;
        }

        importedCss.push(url);

        if (document.createStyleSheet) {
            document.createStyleSheet(url);
        }
        else {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', url);
            document.head.appendChild(link);
        }
    }

    function loadDependencies(dependencies, callback) {

        var css = [];

        var list = dependencies.filter(function (d) {

            if (d.indexOf('css!') == 0) {

                css.push(d.substring(4));
                return false;
            } else {

                return true;
            }
        });

        for (var i = 0, length = css.length; i < length; i++) {
            loadCss(css[i]);
        }

        require(list, callback);
    }

    function loadContentUrl(ctx, next, url) {

        get(url, function (html) {
            ctx.partials.content = html;
            next();
        });
    }

    function getHandler(route) {
        return function (ctx, next) {

            loadDependencies(route.dependencies || [], function () {

                if (typeof route.content === 'string') {

                    if (route.contentType == 'html') {
                        ctx.partials.content = route.content;
                        next();

                    } else {
                        loadContentUrl(ctx, next, route.content);
                    }

                } else {
                    // ? TODO
                    next();
                }
            });
        };
    }

    function renderContent(ctx, next) {

        get('views/content.html', function (html) {
            var template = Hogan.compile(html),
                content = template.render(ctx.data, ctx.partials);
            contentEl.innerHTML = content;

            //if (typeof done === 'function') done(ctx.data.index);
        });
    }

    window.RouteManager = {
        authenticate: authenticate,
        getHandler: getHandler,
        ctx: ctx,
        renderContent: renderContent
    };

})(document, window);
