var rooms = {},
    app = require('./../app.js'),
    nowjs = require('now');

module.exports = {
  getRoom: function(roomname) {
     var room;

     if (!(roomname in rooms)) {
       room = new Room(roomname);
       rooms[roomname] = room;
     }

     return rooms[roomname];
   }
 };

function Room(roomname) {
  this.name = roomname;
  this.roomGroup = nowjs.getGroup(this.name);
  this.station = null;
  this.song = null;

  this.users = {};
}

Room.prototype = {
  addClient: function(user, clientId) {
    this.roomGroup.addUser(clientId);

    // Create the client store if it doesn't already exist
    if (!this.users[user.username]) {
      this.users[user.username] = [];
    }

    this.users[user.username].push(clientId);

    // Only send join notification for initial join
    if (this.users[user.username].length === 1) {
      this.roomGroup.now.receiveJoin(user.username);
    }

    // Update the room's user list
    this.roomGroup.now.updateUsers(JSON.stringify(this.users));
  },

  removeClient: function(user, clientId) {
    var clientIndex = this.users[user.username]
                          .indexOf(clientId);

    this.roomGroup.removeUser(clientId);

    // Remove the client id from the client store
    this.users[user.username].splice(clientIndex, 1);

    // Remove the stored user and send left notification iff
    // there are no remaining clients in room for the given user
    if (this.users[user.username].length === 0) {
      delete this.users[user.username];
      this.roomGroup.now.receiveLeave(user.username);
    }
  }
};
