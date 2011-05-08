var users = {},
    app = require('./../app.js'),
    rdio = app.Rdio;

module.exports = {
  getCurrentUser: function(callback) {
    rdio.request(function(err) {
                   console.log('rdio api call done bad. ' + err);
                   callback(null);
                 }, {}, callback(data));
  }
};

User = function(username, clientId) {
  this.username = username;
  this.clientId = clientId;
  this.room = null;
  this._token = null;
  this._tokensecret = null;
}

User.prototype = {
};
