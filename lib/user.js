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

function User(username) {
  this._username = username;
  this._room = null;
  this._token = null;
  this._tokensecret = null;
}

User.prototype = {
};
