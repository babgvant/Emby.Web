define([], function () {

    return function () {

        var self = this;

        self.name = 'Html Video Player';
        self.type = 'mediaplayer';
        self.packageName = 'htmlvideoplayer';

        self.canPlayMediaType = function (mediaType) {

            return (mediaType || '').toLowerCase() == 'video';
        };

        self.getDeviceProfile = function () {



        };
    }
});