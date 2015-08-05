(function (globalScope) {

    function clearBackdrop() {

        var elem = document.querySelector('.backdropContainer');
        elem.classList.add('hide');
        elem.style.backgroundImage = '';
        document.querySelector('.themeContainer').classList.remove('withBackdrop');
    }

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function setBackdropImage(url) {

        var elem = document.querySelector('.backdropContainer');
        elem.classList.remove('hide');
        elem.style.backgroundImage = "url('" + url + "')";

        document.querySelector('.themeContainer').classList.add('withBackdrop');
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
                    maxWidth: screenWidth,
                    quality: 50
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