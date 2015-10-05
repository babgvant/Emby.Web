define([], function () {
    function update(key, val) {
        appStorage.setItem(key, val);
    }

    return {
        enableAutomaticBitrateDetection: function (val) {

            if (val != null) {
                update('enableAutomaticBitrateDetection', val.toString());
            }

            var savedVal = appStorage.getItem('enableAutomaticBitrateDetection');

            return appStorage.getItem('enableAutomaticBitrateDetection') != 'false';
        },
        maxStreamingBitrate: function (val) {

            if (val != null) {
                update('preferredVideoBitrate', val);
            }

            return parseInt(appStorage.getItem('preferredVideoBitrate') || '') || 1500000;
        }
    };
});