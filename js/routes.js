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

    function allowAnonymous(ctx) {

        return ctx.pathname == 'login';
    }

    function authenticate(ctx, next) {
        if (currentApiClient && currentApiClient.getCurrentUserId()) {
            next();
            return;
        }

        if (!allowAnonymous(ctx))
            page.redirect('login');
        else
            next();
    }

    function loadContentUrl(ctx, next, url) {

        get(url, function (html) {
            ctx.partials.content = html;
            next();
        });
    }

    function getHandler(route) {
        return function (ctx, next) {

            require(route.dependencies || [], function () {

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
