(function (document, window) {
    // Private
    var cache = {};

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
            //contentEl.classList.add('transition');
            setTimeout(function () {
                //content.classList.remove('transition');
                next();
            }, 300);
        }
    }

    function allowAnonymous(ctx) {

        return ctx.pathname == 'login';
    }

    function authenticate(ctx, next) {

        require(['currentServer'], function (server) {

            if (server && server.UserId && server.AccessToken) {
                next();
                return;
            }

            if (!allowAnonymous(ctx)) {
                page.redirect('login');
            }
            else {
                next();
            }
        });
    }

    function loadContent(ctx, next, html) {

        html = Globalize.translateHtml(html);

        Emby.ViewManager.loadView(html);

        //next();
    }

    function loadContentUrl(ctx, next, url) {

        get(url, function (html) {
            loadContent(ctx, next, html);
        });
    }

    function getHandler(route) {
        return function (ctx, next) {

            require(route.dependencies || [], function () {

                if (typeof route.content === 'string') {

                    if (route.contentType == 'html') {
                        loadContent(ctx, next, route.content);

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
            var template = Hogan.compile(html);
            var content = template.render(ctx.data, ctx.partials);

            var contentElement = document.querySelector('.pageContainer');

            if (!contentElement) {
                alert('pageContainer is missing! The theme must render an element with className pageContainer');
                return;
            }

            contentElement.innerHTML = content;

            //if (typeof done === 'function') done(ctx.data.index);
        });
    }

    function getWindowUrl(win) {
        return (win || window).location.href;
    }

    function getWindowLocationSearch(win) {

        var search = (win || window).location.search;

        if (!search) {

            var index = window.location.href.indexOf('?');
            if (index != -1) {
                search = window.location.href.substring(index);
            }
        }

        return search || '';
    }

    function param(name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS, "i");

        var results = regex.exec(url || getWindowLocationSearch());
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    window.RouteManager = {
        authenticate: authenticate,
        getHandler: getHandler,
        ctx: ctx,
        renderContent: renderContent,
        param: param
    };

})(document, window);
