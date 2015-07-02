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

    // Public
    window.init = {
        auth: function (ctx, next) {

            if (currentApiClient && currentApiClient.getCurrentUserId()) {
                next();
                return;
            }

            if (ctx.pathname !== '/login')
                page.redirect('/login');
            else
                next();
        },
        ctx: function (ctx, next) {
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
    };

    window.route = {
        login: function (ctx, next) {
            get('views/login.html', function (html) {
                ctx.data.index = -1;
                ctx.partials.content = html;
                next();
            });
        },
        getHandler: function (route) {

            return function (ctx, next) {

                // TODO
                // route has:
                // path (string)
                // content (object) - we can let them add a string for an html url, or maybe a string for a dom selector. Or function delegate for advanced usage
                // contentType - if necessary to distinguish string from url/dom selector
                // dependencies array

            };
        }
    };

    window.render = {
        content: function (ctx, next) {
            get('views/content.html', function (html) {
                var template = Hogan.compile(html),
					content = template.render(ctx.data, ctx.partials);
                contentEl.innerHTML = content;
                changeActive(ctx.data.index);
                if (typeof done === 'function') done(ctx.data.index);
            });
        }
    };

    window.done = null;
})(document, window);
