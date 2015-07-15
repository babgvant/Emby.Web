(function (document) {

    function onWelcomeLoad(element) {

        element.querySelector('.btnWelcomeNext').addEventListener('click', function () {

            page.redirect('/startup/connectlogin');
        });
    }
    document.addEventListener("viewshow", function (e) {

        var element = e.detail.element;

        if (e.detail.id == 'welcome') {
            onWelcomeLoad(element);
        }
    })

})(document);