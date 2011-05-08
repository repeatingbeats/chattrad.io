
var RDIO_BASE_URL = 'http://api.rdio.com',
    RDIO_URL = RDIO_BASE_URL + '/1/'
    OAuth= require('oauth').OAuth
;

module.exports.Rdio = function (config) {

  var _publicAPI = {},
      _key = config.key,
      _secret = config.secret,
      _cb = config.cb,
      _oauth_consumer = new OAuth(RDIO_BASE_URL + '/oauth/request_token',
                                  RDIO_BASE_URL + '/oauth/access_token',
                                  _key,
                                  _secret,
                                  "1.0",
                                  _cb,
                                  "HMAC-SHA1");

  _publicAPI.requestToken = function(errorback, options, callback) {
    var data = {};

    _oauth_consumer.getOAuthRequestToken(function(error,
                                                  oauth_token,
                                                  oauth_token_secret,
                                                  results) {
                                           if (error) {
                                             errorback(error);
                                           } else {
                                             data.oa = _oauth_consumer;
                                             data.oauth_token = oauth_token;
                                             data.oauth_token_secret = oauth_token_secret;
                                             callback(data);
                                           }
                                         });
  };

  _publicAPI.request = function(errorback, options, callback) {

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
                           else callback(JSON.parse(data));
                         });
  };

  return _publicAPI;

}

