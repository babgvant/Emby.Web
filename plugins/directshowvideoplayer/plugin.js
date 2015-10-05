define([], function () {

    return function () {

        var self = this;

        self.name = 'DirectShow Player';
        self.type = 'mediaplayer';
        self.packageName = 'directshowvideoplayer';

        self.canPlayMediaType = function (mediaType) {

            return (mediaType || '').toLowerCase() == 'video';
        };
    }
});