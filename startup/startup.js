(function (document) {

    function onWelcomeLoad(element) {

        element.querySelector('.btnWelcomeNext').addEventListener('click', function () {

            page.redirect('/startup/connectlogin.html');
        });
    }
    function onConnectLoginLoad(element) {

        element.querySelector('.btnWelcomeNext').addEventListener('click', function () {

            page.redirect('/startup/welcome.html');
        });
    }
    document.addEventListener("viewshow", function (e) {

        var element = e.detail.element;

        if (e.detail.id == 'welcome') {
            onWelcomeLoad(element);
        }

        else if (e.detail.id == 'connectlogin') {
            onConnectLoginLoad(element);
        }
    })

})(document);