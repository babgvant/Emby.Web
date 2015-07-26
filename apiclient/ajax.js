(function (globalScope) {

    globalScope.HttpClient = {

        param: function (params) {
            return serialize(params);
        },

        send: function (request) {

            var deferred = DeferredBuilder.Deferred();

            require(['type', 'bower_components/ajax/index'], function () {

                // See https://github.com/ForbesLindesay/ajax

                // This library is probably preferred:
                // https://github.com/visionmedia/superagent
                // But don't really want to spend time integrating that right now

                request.timeout = request.timeout || 30000;

                request.success = function (data, status, xhr) {
                    deferred.resolveWith(null, [data]);
                };

                request.error = function (xhr, type, error) {
                    deferred.rejectWith(request, [xhr]);
                };

                Logger.log('Sending request to ' + request.url);

                try {
                    ajax(request);
                } catch (err) {
                    Logger.log(err);
                    deferred.rejectWith(request, []);
                }
            });

            return deferred.promise();
        },

        request: function (request) {
            return new Promise(function (resolve, reject) {

                require(['type', 'bower_components/ajax/index'], function () {

                    // See https://github.com/ForbesLindesay/ajax

                    // This library is probably preferred:
                    // https://github.com/visionmedia/superagent
                    // But don't really want to spend time integrating that right now

                    request.timeout = request.timeout || 30000;

                    request.success = function (data, status, xhr) {
                        resolve(data);
                    };

                    request.error = function (xhr, type, error) {
                        reject(xhr);
                    };

                    Logger.log('Sending request to ' + request.url);

                    try {
                        ajax(request)
                    } catch (err) {
                        Logger.log(err);
                        reject();
                    }
                });
            });
        }
    };

    // Code from: http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
    function serialize(obj, prefix) {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?
                  serialize(v, k) :
                  encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }

})(this);