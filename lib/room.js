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
  addUser: function(user) {
    this.roomGroup.addUser(user.clientId);

    if (!this.users[user.username]) {
      this.users[user.username] = [];
    }

    this.users[user.username].push(user.clientId);

    if (this.users[user.username].length === 1) {
      this.roomGroup.now.receiveJoin(user.username);
    }

    this.roomGroup.now.updateUsers(JSON.stringify(this.users));
  },

  removeUser: function(user) {
    var clientId = user.clientId,
        clientIndex = this.users[user.username]
                          .indexOf(clientId);

    this.roomGroup.removeUser(clientId);

    this.users[user.username].splice(clientIndex, 1);

    if (this.users[user.username].length === 0) {
      delete this.users[user.username];
      this.roomGroup.now.receiveLeave(user.username);
    }
  }
};
