define(['html!bower_components/paper-spinner/paper-spinner'], function () {

    return {
        show: function () {
            var elem = document.querySelector('.docspinner');

            if (elem) {

                elem.active = true;

            } else {

                elem = document.createElement("paper-spinner");
                elem.classList.add('docspinner');

                document.body.appendChild(elem);
                elem.active = true;
            }
        },
        hide: function () {
            var elem = document.querySelector('.docspinner');

            if (elem) {

                elem.active = false;

                setTimeout(function () {
                    elem.active = false;
                }, 100);
            }
        }
    };
});