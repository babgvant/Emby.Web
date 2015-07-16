(function (document, window) {

    function ctx(ctx, next) {
        next();
    }

    function allowAnonymous(ctx) {

        var path = ctx.pathname;

        if (path.indexOf('welcome') != -1) {
            return true;
        }

        if (path.indexOf('connectlogin') != -1) {
            return true;
        }

        if (path.indexOf('login') != -1) {
            return true;
        }

        if (path.indexOf('manuallogin') != -1) {
            return true;
        }

        if (path.indexOf('manualserver') != -1) {
            return true;
        }

        if (path.indexOf('selectserver') != -1) {
            return true;
        }

        return false;
    }

    function authenticate(ctx, next) {

        require(['currentServer'], function (server) {

            if (server && server.UserId && server.AccessToken) {
                next();
                return;
            }

            if (!allowAnonymous(ctx)) {
                page.show('/startup/welcome.html');
            }
            else {
                next();
            }
        });
    }

    function loadContent(ctx, next, html, id, url) {

        html = Globalize.translateHtml(html);
        Emby.ViewManager.loadView({
            id: id,
            view: html,
            url: url
        });

        ctx.handled = true;
        //next();
    }

    function loadContentUrl(ctx, next, url, id, routeUrl) {

        HttpClient.send({

            url: url,
            type: 'GET',
            dataType: 'html'

        }).done(function (html) {
            loadContent(ctx, next, html, id, routeUrl);

        }).fail(function () {
            next();
        });
    }

    function getHandler(route) {
        return function (ctx, next) {

            require(route.dependencies || [], function () {

                var url = window.location.href;

                if (Emby.ViewManager.tryRestoreView(url)) {
                    // done
                }
                else if (typeof route.content === 'string') {

                    if (route.contentType == 'html') {
                        loadContent(ctx, next, route.content, route.id, url);

                    } else {
                        loadContentUrl(ctx, next, route.content, route.id, url);
                    }

                } else {
                    // ? TODO
                    next();
                }
            });
        };
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
        param: param
    };

})(document, window);
