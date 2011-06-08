var rooms = {},
    app = require('./../app.js'),
    nowjs = require('now');

module.exports = {

  createRoom: function (roomname) {

    if (roomname in rooms) {
      throw new Error(roomname + ' room already exists');
    }

    room = new Room(roomname);
    rooms[roomname] = room;

    return room;
  },

  getRoom: function(roomname) {
    // Explicitly return null if the room does not exist
    if (roomname in rooms) {
      return rooms[roomname];
    } else {
      return null;
    }
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
    user.clients[clientId].push(this.name);

    if (!this.users[user.username]) {
      this.roomGroup.now.receiveJoin(user.username);
      this.users[user.username] = user;
    }

    // Update the room's user list
    this.roomGroup.now.updateUsers(JSON.stringify(this.users));
  },

  removeClient: function(user, clientId) {
    var self = this,
        inRoom = false,
        roomIdx = user.clients[clientId]
                      .indexOf(this.name);

    this.roomGroup.removeUser(clientId);
    user.clients[clientId].splice(roomIdx, 1);

    for (var client in user.clients) {
      if (user.clients.hasOwnProperty(client)) {
        user.clients[client].forEach(function(r) {
          if (r === self.name) {
            inRoom = true;
          }
        });
      }
    }

    // Remove the stored user and send left notification iff
    // there are no remaining clients in room for the given user
    if (inRoom) {
      this.users[user.username] = user;
    } else {
      delete this.users[user.username];
      this.roomGroup.now.receiveLeave(user.username);
    }
  }
};

module.exports.Room = Room;

