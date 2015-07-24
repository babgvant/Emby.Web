define(['html!bower_components/paper-dialog/paper-dialog', 'html!bower_components/neon-animation/animations/fade-in-animation.html', 'html!bower_components/neon-animation/animations/fade-out-animation.html'], function () {

    return function (options) {

        if (typeof options === 'string') {
            options = {
                title: Globalize.translate('HeaderAlert'),
                text: options
            };
        }

        var message = options.text;
        var title = options.title;
        var callback = options.callback;

        var id = 'paperdlg' + new Date().getTime();

        var dlg = document.createElement('paper-dialog');
        dlg.id = id;
        dlg.role = "alertdialog";
        dlg.entryAnimation = 'fade-in-animation';
        dlg.exitAnimation = 'fade-out-animation';
        dlg.withBackdrop = true;

        var html = '';
        html += '<h2>' + title + '</h2>';
        html += '<div>' + message + '</div>';
        html += '<div class="buttons">';

        html += '<paper-button class="btnConfirm" dialog-confirm autofocus>' + Globalize.translate('ButtonOk') + '</paper-button>';

        html += '</div>';

        dlg.innerHTML = html;
        document.body.appendChild(dlg);

        // This timeout is obviously messy but it's unclear how to determine when the webcomponent is ready for use
        // element onload never fires
        setTimeout(function () {

            // Has to be assigned a z-index after the call to .open() 
            dlg.addEventListener('iron-overlay-closed', function (e) {

                this.parentNode.removeChild(this);

                if (callback) {
                    callback();
                }
            });

            dlg.open();

        }, 300);
    };
});