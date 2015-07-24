(function (document, window) {

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

    function redirectToLogin(ctx, next) {

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            connectionManager.connect().done(function (result) {

                switch (result.State) {

                    case MediaBrowser.ConnectionState.SignedIn:
                        {
                            loading.hide();
                            Emby.ThemeManager.loadUserTheme();
                        }
                        break;
                    case MediaBrowser.ConnectionState.ServerSignIn:
                        {
                            result.ApiClient.getPublicUsers().done(function (users) {

                                if (users.length) {
                                    page.show('/startup/login.html?serverid=' + result.Servers[0].Id);
                                } else {
                                    page.show('/startup/manuallogin.html?serverid=' + result.Servers[0].Id);
                                }
                            });
                        }
                        break;
                    case MediaBrowser.ConnectionState.ServerSelection:
                        {
                            page.show('/startup/selectserver.html');
                        }
                        break;
                    case MediaBrowser.ConnectionState.ConnectSignIn:
                        {
                            page.show('/startup/welcome.html');
                        }
                        break;
                    default:
                        break;
                }
            });
        });
    }

    function handleRoute(ctx, next, route) {

        authenticate(ctx, route, function () {
            require(route.dependencies || [], function () {

                var url = window.location.href;

                if (Emby.ViewManager.tryRestoreView(url)) {
                    // done
                }
                else if (typeof route.path === 'string') {

                    loadContentUrl(ctx, next, route.path, route.id, url);

                } else {
                    // ? TODO
                    next();
                }
            });
        });
    }

    function authenticate(ctx, route, callback) {

        require(['connectionManager'], function (connectionManager) {

            var server = connectionManager.currentLoggedInServer();
            var pathname = ctx.pathname.toLowerCase();

            Logger.log('RouteManager - processing path request ' + pathname);

            if (server) {

                Logger.log('RouteManager - user is authenticated');

                if (route.isDefaultRoute) {
                    Logger.log('RouteManager - loading theme home page');
                    Emby.ThemeManager.loadUserTheme();
                } else {
                    Logger.log('RouteManager - next()');
                    callback();
                }
                return;
            }

            Logger.log('RouteManager - user is not authenticated');

            if (!allowAnonymous(ctx)) {

                Logger.log('RouteManager - route does not allow anonymous access, redirecting to login');
                redirectToLogin();
            }
            else {
                Logger.log('RouteManager - proceeding to ' + pathname);
                callback();
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

    var baseRoute = window.location.href.replace('/index.html', '');
    if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
        baseRoute = baseRoute.substring(0, baseRoute.length - 1);
    }

    function loadContentUrl(ctx, next, url, id, routeUrl) {

        url = baseRoute + '/' + url;

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
            handleRoute(ctx, next, route);
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

    function back() {
        history.back();
    }

    window.RouteManager = {
        getHandler: getHandler,
        param: param,
        back: back
    };

})(document, window);
