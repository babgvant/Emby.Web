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

    function redirectToLogin(ctx, next) {

        Emby.elements.loading.show();

        require(['connectionManager'], function (connectionManager) {
            connectionManager.connect().done(function (result) {

                switch (result.State) {

                    case MediaBrowser.ConnectionState.SignedIn:
                        {
                            Emby.ThemeManager.loadUserTheme();
                            Emby.elements.loading.hide();
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

    function authenticate(ctx, next) {

        require(['currentLoggedInServer'], function (server) {

            if (server) {
                
                if (ctx.path.toLowerCase() == '/index.html') {
                    Emby.ThemeManager.loadUserTheme();
                } else {
                    next();
                }
                return;
            }

            if (!allowAnonymous(ctx)) {
                redirectToLogin();
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
                else if (typeof route.path === 'string') {

                    loadContentUrl(ctx, next, route.path, route.id, url);

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

    function back() {
        history.back();
    }

    window.RouteManager = {
        authenticate: authenticate,
        getHandler: getHandler,
        ctx: ctx,
        param: param,
        back: back
    };

})(document, window);
