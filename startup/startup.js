(function (document) {

    function onWelcomeLoad(element) {

        element.querySelector('.btnWelcomeNext').addEventListener('click', function () {

            Emby.elements.loading.show();

            require(['connectionManager'], function (connectionManager) {
                connectionManager.connect().done(function (result) {

                    Emby.elements.loading.hide();

                    handleConnectionResult(result);
                });
            });
        });
    }

    function onManualLoginLoad(element) {

        element.querySelector('.txtUserName').value = '';
        element.querySelector('.txtPassword').value = '';

        element.querySelector('form').addEventListener('submit', function (e) {

            Emby.elements.loading.show();

            var username = this.querySelector('.txtUserName').value;
            var password = this.querySelector('.txtPassword').value;

            var serverId = RouteManager.param('serverid');

            require(['connectionManager'], function (connectionManager) {
                connectionManager.getApiClient(serverId).authenticateUserByName(username, password).done(function (result) {

                    Emby.elements.loading.hide();

                    Emby.ThemeManager.loadUserTheme();

                }).fail(function (result) {

                    Emby.elements.loading.hide();

                    Emby.elements.alert({
                        text: Globalize.translate('MessageInvalidUser')
                    });
                });
            });

            e.preventDefault();
            return false;
        });

        element.querySelector('.buttonCancel').addEventListener('click', function (e) {

            history.back();
        });
    }

    function onManualServerLoad(element) {

        element.querySelector('.txtServerHost').value = '';
        element.querySelector('.txtServerPort').value = '';

        element.querySelector('form').addEventListener('submit', function (e) {

            var address = this.querySelector('.txtServerHost').value;
            var port = this.querySelector('.txtServerPort').value;

            if (port) {
                address += ':' + port;
            }

            Emby.elements.loading.show();

            require(['connectionManager'], function (connectionManager) {
                connectionManager.connectToAddress(address).done(function (result) {

                    Emby.elements.loading.hide();

                    handleConnectionResult(result);
                });
            });

            e.preventDefault();
            return false;
        });

        element.querySelector('.buttonCancel').addEventListener('click', function (e) {

            page.show('/startup/selectserver.html');
        });
    }

    function onConnectLoginLoad(element) {

        element.querySelector('.txtConnectUserName').value = '';
        element.querySelector('.txtConnectPassword').value = '';

        element.querySelector('form').addEventListener('submit', function (e) {

            signIntoConnect(element);
            e.preventDefault();
            return false;
        });

        element.querySelector('.btnSkipConnect').addEventListener('click', function (e) {

            Emby.elements.loading.show();

            require(['connectionManager'], function (connectionManager) {
                connectionManager.connect().done(function (result) {

                    Emby.elements.loading.hide();

                    if (result.State == MediaBrowser.ConnectionState.ConnectSignIn) {
                        page.show('/startup/manualserver.html');
                    } else {
                        handleConnectionResult(result);
                    }
                });
            });
        });
    }

    function signIntoConnect(view) {

        var username = view.querySelector('.txtConnectUserName').value;
        var password = view.querySelector('.txtConnectPassword').value;

        Emby.elements.loading.show();

        require(['connectionManager'], function (connectionManager) {
            connectionManager.loginToConnect(username, password).done(function () {

                Emby.elements.loading.hide();

                page.show('/startup/selectserver.html');

            }).fail(function () {

                Emby.elements.loading.hide();

                Emby.elements.alert({
                    text: Globalize.translate('MessageInvalidUser'),
                    title: Globalize.translate('HeaderLoginFailure')
                });

            });
        });
    }

    function handleConnectionResult(result) {

        switch (result.State) {

            case MediaBrowser.ConnectionState.SignedIn:
                {
                    Emby.ThemeManager.loadUserTheme();
                }
                break;
            case MediaBrowser.ConnectionState.ServerSignIn:
                {
                    Emby.elements.loading.show();
                    result.ApiClient.getPublicUsers().done(function (users) {
                        Emby.elements.loading.hide();

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
                    page.show('/startup/connectlogin.html');
                }
                break;
            case MediaBrowser.ConnectionState.Unavailable:
                {
                    Emby.elements.alert({
                        text: Globalize.translate("MessageUnableToConnectToServer"),
                        title: Globalize.translate("HeaderConnectionFailure")
                    });
                }
                break;
            default:
                break;
        }
    }

    document.addEventListener("viewshow", function (e) {

        var element = e.detail.element;

        if (e.detail.id == 'welcome') {
            onWelcomeLoad(element);
        }

        else if (e.detail.id == 'connectlogin') {
            onConnectLoginLoad(element);
        }

        else if (e.detail.id == 'manualserver') {
            onManualServerLoad(element);
        }

        else if (e.detail.id == 'manuallogin') {
            onManualLoginLoad(element);
        }
    })

})(document);