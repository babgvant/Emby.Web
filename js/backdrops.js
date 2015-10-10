(function (globalScope) {

    function clearBackdrop() {

        removeBackdropImage();

        var elem = document.querySelector('.backdropContainer');
        elem.classList.add('hide');
        elem.style.backgroundImage = '';
        document.querySelector('.themeContainer').classList.remove('withBackdrop');
    }

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function removeBackdropImage() {

        var elem = document.querySelector('.backdropImage');
        if (elem) {
            elem.parentNode.removeChild(elem);
        }
    }

    function setBackdropImage(url) {

        var existingBackdropImage = document.querySelector('.backdropImage');

        if (existingBackdropImage && existingBackdropImage.getAttribute('data-url') == url) {
            return;
        }

        var elem = document.querySelector('.backdropContainer');
        elem.classList.remove('hide');

        var backdropImage = document.createElement('div');
        backdropImage.classList.add('backdropImage');
        backdropImage.style.backgroundImage = "url('" + url + "')";
        backdropImage.setAttribute('data-url', url);

        backdropImage.classList.add('hide');

        elem.appendChild(backdropImage);

        setTimeout(function () {

            backdropImage.classList.remove('hide');
            fadeIn(backdropImage, 1).onfinish = function() {
                if (existingBackdropImage && existingBackdropImage.parentNode) {
                    existingBackdropImage.parentNode.removeChild(existingBackdropImage);
                }
            };

        }, 100);

        document.querySelector('.themeContainer').classList.add('withBackdrop');
    }

    function fadeIn(elem, iterations) {
        var keyframes = [
          { opacity: '0', offset: 0 },
          { opacity: '1', offset: 1 }];
        var timing = { duration: 500, iterations: iterations };
        return elem.animate(keyframes, timing);
    }

    function setBackdrops(items) {

        var images = items.map(function (i) {

            if (i.BackdropImageTags.length > 0) {
                return {
                    id: i.Id,
                    tag: i.BackdropImageTags[0]
                };
            }

            if (i.ParentBackdropItemId && i.ParentBackdropImageTags && i.ParentBackdropImageTags.length) {

                return {
                    id: i.ParentBackdropItemId,
                    tag: i.ParentBackdropImageTags[0]
                };
            }
            return null;

        }).filter(function (i) {
            return i != null;
        });

        if (images.length) {

            var index = getRandom(0, images.length - 1);
            var item = images[index];

            var screenWidth = window.innerWidth;

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();
                var imgUrl = apiClient.getScaledImageUrl(item.id, {
                    type: "Backdrop",
                    tag: item.tag,
                    //maxWidth: screenWidth,
                    quality: 100,
                    format: 'jpg'
                });

                setBackdropImage(imgUrl);
            });

        } else {
            clearBackdrop();
        }
    }

    function setBackdrop(url) {

        if (url) {
            setBackdropImage(url);

        } else {
            clearBackdrop();
        }
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.Backdrop = {

        setBackdrops: setBackdrops,
        setBackdrop: setBackdrop,
        clear: clearBackdrop
    };

})(this);