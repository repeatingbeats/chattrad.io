var nowjs = require("now");

Room = function (aName) {
  this.name = aName;
  this.roomGroup = nowjs.getGroup(this.name);
  this.song = null;
}

Room.prototype = {

  addUser: function(user) {
    this.roomGroup.addUser(user.clientId);
    user.room = this;
  },

  removeUser: function(user) {
    this.roomGroup.removeUser(user.clientId);
    user.room = null;
  }

}
