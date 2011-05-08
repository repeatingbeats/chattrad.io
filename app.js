
var express = require('express'),
    jade = require('jade'),
    app = module.exports = express.createServer();

var DOTCLOUD_APP_PORT = 8080;

app.API_KEYS = require('./config/api_keys');
app.Rdio = require('./lib/rdio').Rdio({
  key: app.API_KEYS['rdio']['key'],
  secret: app.API_KEYS['rdio']['secret']
});

var LastFmNode = require('lastfm').LastFmNode;
app.lastfm = new LastFmNode({
  api_key: app.API_KEYS['lastfm']['key'],
  secret: app.API_KEYS['lastfm']['secret']
});

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compiler({ src: __dirname + '/public',
                           enable: [ 'less' ]}));
  app.use(express.logger({
    format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms'
  }));
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('test', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

if (!module.parent) {
  app.listen(DOTCLOUD_APP_PORT);
  console.log("express server listening on port %d, env: %s",
              app.address().port,
              app.settings.env);
}

require('./routes/all')(app);

// NowJS component
var nowjs = require("now");
var everyone = nowjs.initialize(app);

STATUS = {
  PLAYING: 0,
  FINISHED: 1,
};

everyone.now.STATUS = STATUS;

everyone.connected(function(){
  console.log("Joined: " + this.now.name);
});

everyone.disconnected(function(){
  console.log("Left: " + this.now.name);
});

everyone.now.distributeMessage = function(message){
  var user = Users[this.user.clientId];

  // make sure we have an internal user and room
  if (!user || !user.room) return;
  user.room.roomGroup.now.receiveMessage(user.nick, message);
};

require('./lib/room.js');
require('./lib/user.js');

Rooms = {};
Users = {};

everyone.now.join = function(roomName) {
  var room = null;
  if (roomName in Rooms) {
    room = Rooms[roomName];
  }
  else {
    room = new Room(roomName);
    Rooms[roomName] = room;
  }

  var user = null;
  if (this.user.clientId in Users) {
    user = Users[this.user.clientId];
    if (user.room) user.room.removeUser(user);
  }
  else { // jhawk we won't do this normally, we'll create the User onload
    user = new User(this.now.name, this.user.clientId);
    Users[this.user.clientId] = user;
  }

  room.addUser(user);
}

everyone.now.updateStatus = function(status){

  // If we don't have an internal user we can't do anything,
  // but this really shouldn't happen.
  var user = Users[this.user.clientId];
  if (!user || !user.room) {
    return;
  }
  var str = "";
  if (status == STATUS.FINISHED) {
    str = "finished!";
  }
  else if (status == STATUS.PLAYING) {
    str = "playing!";
  }
  else {
    str = "something else!";
  }

  user.room.roomGroup.now.echo(str + " " + user.room.name);
};
