(function (globalScope) {

    function horizontalList(options) {

        var self = this;
        var getItemsMethod = options.getItemsMethod;
        var lastFocus = 0;
        var focusedElement;
        var currentAnimation;

        self.render = function () {

            if (options.itemsContainer) {
                options.itemsContainer.addEventListener('focusin', onFocusIn);
                options.itemsContainer.addEventListener('focusout', onFocusOut);
            }

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
                    cardOptions.itemsContainer = options.itemsContainer;
                    cardOptions.shape = cardOptions.shape || 'auto';
                    cardOptions.rows = cardOptions.rows || 1;

                    DefaultTheme.CardBuilder.buildCards(result.Items, cardOptions);

                    loading.hide();

                    if (options.autoFocus !== false) {
                        setTimeout(function () {
                            var firstCard = options.itemsContainer.querySelector('.card');
                            if (firstCard) {
                                Emby.FocusManager.focus(firstCard);
                            }
                        }, 400);
                    }
                });
            });
        };

        function onFocusIn(e) {
            var focused = Emby.FocusManager.focusableParent(e.target);
            focusedElement = focused;

            if (focused) {

                var selectedIndexElement = options.selectedIndexElement;
                if (selectedIndexElement) {
                    var index = focused.getAttribute('data-index');
                    if (index) {
                        selectedIndexElement.innerHTML = 1 + parseInt(index);
                    }
                }

                var now = new Date().getTime();
                var animate = (now - lastFocus) > 100;
                options.slyFrame.toCenter(focused, !animate);
                lastFocus = now;

                startZoomTimer();
            }
        }

        function onFocusOut(e) {
            var focused = focusedElement;
            focusedElement = null;

            if (focused) {
                var elem = focused.querySelector('.focusedTransform');
                if (elem) {
                    elem.classList.remove('focusedTransform');
                }
            }

            if (currentAnimation) {
                currentAnimation.cancel();
                currentAnimation = null;
            }
        }

        var zoomTimeout;
        var selectedMediaInfoTimeout;
        function startZoomTimer() {

            if (onZoomTimeout) {
                clearTimeout(zoomTimeout);
            }
            zoomTimeout = setTimeout(onZoomTimeout, 50);
            if (selectedMediaInfoTimeout) {
                clearTimeout(selectedMediaInfoTimeout);
            }
            selectedMediaInfoTimeout = setTimeout(onSelectedMediaInfoTimeout, 400);
        }

        function onZoomTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                zoomIn(focused);
            }
        }

        function onSelectedMediaInfoTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                setSelectedItemInfo(focused);
            }
        }

        function zoomIn(elem) {

            if (elem.classList.contains('noScale')) {
                return;
            }

            var keyframes = [
                { transform: 'scale(1)  ', offset: 0 },
              { transform: 'scale(1.12)', offset: 1 }
            ];

            var card = elem;
            elem = elem.tagName == 'PAPER-BUTTON' ? elem.querySelector('.content') : elem.querySelector('.cardBox');

            var onAnimationFinished = function () {
                if (document.activeElement == card) {
                    elem.classList.add('focusedTransform');
                }
                currentAnimation = null;
            };

            if (elem.animate) {
                var timing = { duration: 200, iterations: 1 };
                var animation = elem.animate(keyframes, timing);

                animation.onfinish = onAnimationFinished;
                currentAnimation = animation;
            } else {
                onAnimationFinished();
            }
        }

        function setSelectedItemInfo(card) {

            if (!options.selectedItemInfoElement) {
                return;
            }

            var index = parseInt(card.getAttribute('data-index'));
            var item = self.items[index];

            var html = '';

            if (item) {
                html += '<div>';
                html += item.Name;
                html += '</div>';

                var mediaInfo = DefaultTheme.CardBuilder.getMediaInfoHtml(item);

                if (mediaInfo) {
                    html += '<div>';
                    html += mediaInfo;
                    html += '</div>';
                }

                var logoImageUrl = Emby.Models.logoImageUrl(item, {
                });

                if (logoImageUrl) {
                    options.selectedItemInfoElement.classList.add('selectedItemInfoInnerWithLogo');

                    html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';

                } else {
                    options.selectedItemInfoElement.classList.remove('selectedItemInfoInnerWithLogo');
                }
            }

            options.selectedItemInfoElement.innerHTML = html;
        }

        self.destroy = function () {

            if (options.itemsContainer) {
                options.itemsContainer.removeEventListener('focusin', onFocusIn);
                options.itemsContainer.removeEventListener('focusout', onFocusOut);
            }

            if (options.selectedItemInfoElement) {
                options.selectedItemInfoElement.innerHTML = '';
                options.selectedItemInfoElement.classList.remove('selectedItemInfoInnerWithLogo');
            }
        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.HorizontalList = horizontalList;

})(this);