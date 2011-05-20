var users = {},
    app = require('./../app.js'),
    rdio = app.Rdio;

module.exports = {
  getUser: function(clientId) {
    var user;

    if (!(clientId in users)) {
      user = new User(clientId);
      users[clientId] = user;
    } else {
      user = users[clientId];
    }

    return user;
  }
};

function User(clientId) {
  this.username = null;
  this.clientId = clientId;
  this.rooms = [];
  this._token = null;
  this._tokensecret = null;
}

User.prototype = {
};
