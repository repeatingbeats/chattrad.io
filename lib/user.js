var users = {};

module.exports = {
  createUser: function(username, options) {
    var user = this.getUser(username);

    // Add optional attributes to user
    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        user[option] = options[option];
      }
    }

    // Store the user
    users[username] = user;

    return user;
  },

  getUser: function(username, clientId) {
    var user;

    if (!(username in users)) {
      user = new User(username);
      users[username] = user;
    } else {
      user = users[username];
    }

    if (clientId) {
      user._ensureClient(clientId);
    }

    return user;
  }
};

function User(username) {
  this.username = username;
  this.clients = {};
}

User.prototype = {
  _ensureClient: function(clientId) {
    if (!(this.clients.hasOwnProperty(clientId))) {
      this.clients[clientId] = [];
    }
  }
};
