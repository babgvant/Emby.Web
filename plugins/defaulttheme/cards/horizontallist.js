(function (globalScope) {

    function horizontalList(options) {

        var self = this;
        var itemsContainer = options.itemsContainer;
        var getItemsMethod = options.getItemsMethod;
        var slyFrame = options.slyFrame;

        self.render = function () {

            require(['loading'], function (loading) {

                loading.show();

                getItemsMethod(0, 300).then(function (result) {

                    // Normalize between the different response types
                    if (result.Items == null && result.TotalRecordCount == null) {

                        result = {
                            Items: result,
                            TotalRecordCount: result.length
                        };
                    }

                    self.items = result.Items;

                    if (options.listCountElement) {
                        options.listCountElement.innerHTML = result.TotalRecordCount;
                        options.listNumbersElement.classList.remove('hide');
                    }

                    var cardOptions = options.cardOptions || {};
                    cardOptions.itemsContainer = itemsContainer;
                    cardOptions.shape = cardOptions.shape || 'auto';
                    cardOptions.rows = cardOptions.rows || 1;

                    DefaultTheme.CardBuilder.buildCards(result.Items, cardOptions);

                    loading.hide();

                    if (options.autoFocus !== false) {
                        setTimeout(function () {
                            var firstCard = itemsContainer.querySelector('.card');
                            if (firstCard) {
                                Emby.FocusManager.focus(firstCard);
                            }
                        }, 400);
                    }
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