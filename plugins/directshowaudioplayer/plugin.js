define([], function () {

    return function () {

        var self = this;

        self.name = 'DirectShow Audio Player';
        self.type = 'mediaplayer';
        self.packageName = 'directshowaudioplayer';

        self.canPlayMediaType = function (mediaType) {

            return (mediaType || '').toLowerCase() == 'audio';
        };
    }
});