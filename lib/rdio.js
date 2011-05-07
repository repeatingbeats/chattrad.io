
var RDIO_BASE_URL = 'http://api.rdio.com',
    RDIO_URL = RDIO_BASE_URL + '/1/'
    OAuth= require('oauth').OAuth
;

module.exports.Rdio = function (config) {

  var _publicAPI = {},
  var _key = config.key,
      _secret = config.secret,
      _oauth_consumer = new OAuth(RDIO_BASE_URL + '/oauth/request_token',
                                  RDIO_BASE_URL + '/oauth/access_token',
                                  _key,
                                  _secret,
                                  "1.0",
                                  null,
                                  "HMAC-SHA1");

  publicAPI.request = function(errorback, options, callback) {

    var token = null,
        token_secret = null;

    if (options['token']) {
      token = options['token'];
      delete options['token'];
    }

    if (options['token_secret']) {
      token_secret = options['token_secret'];
      delete options['token_secret'];
    }

    _oauth_consumer.post(RDIO_URL,
                         token,
                         token_secret,
                         options,
                         'application/x-www-form-urlencoded',
                         function (err, data, res) {
                           if (err) errorback(err);
                           else callback(data);
                         });
  };

  return publicAPI;

}

