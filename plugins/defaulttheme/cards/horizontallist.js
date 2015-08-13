(function (globalScope) {

    function horizontalList(options) {

        var self = this;
        var itemsContainer = options.itemsContainer;
        var getItemsMethod = options.getItemsMethod;
        var slyFrame = options.slyFrame;

        self.render = function () {

            require(['loading'], function (loading) {

                loading.show();

                getItemsMethod().then(function (result) {

                    if (options.listCountElement) {
                        options.listCountElement.innerHTML = result.TotalRecordCount;
                        options.listNumbersElement.classList.remove('hide');
                    }

                    DefaultTheme.CardBuilder.buildCards(result.Items, {
                        itemsContainer: itemsContainer,
                        shape: 'auto',
                        rows: 2
                    });

                    loading.hide();

                    setTimeout(function () {
                        var firstCard = itemsContainer.querySelector('.card');
                        if (firstCard) {
                            Emby.FocusManager.focus(firstCard);
                        }
                    }, 400);
                });
            });
        };

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.HorizontalList = horizontalList;

})(this);