
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

app.echonest = require('./lib/echonestjs/echonest');
app.echonest.api_key = app.API_KEYS['echonest']['key'];

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'omgwtfcoocooroo' }));
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

  console.log(message);
  console.log((user));
  // make sure we have an internal user and room
  if (!user || !user.room) return;
  user.room.roomGroup.now.receiveMessage(user.nick, message);
};

// Get the models we'll need
require('./lib/room.js');
require('./lib/user.js');
require('./lib/song.js');

// Maps of all Rooms and Users
Rooms = {};
Users = {};

/* A join method for every client */
everyone.now.join = function(roomName) {
  // See if the room already exists, if not create it
  var room = null;
  if (roomName in Rooms) {
    room = Rooms[roomName];
  }
  else {
    room = new Room(roomName);
    Rooms[roomName] = room;
  }

  // Find our internal User object for the user
  var user = null;
  if (this.user.clientId in Users) {
    user = Users[this.user.clientId];
    if (user.room) user.room.removeUser(user);
  }
  else { // jhawk we won't do this normally, we'll create the User onload
    user = new User(this.now.name, this.user.clientId);
    Users[this.user.clientId] = user;
  }

  // jhawk temporary we give the room a song, we'll normally have this
  if (!room.song) {
    room.song = new Song("999");
  }

  // Add the user to our room and nowjs group
  room.addUser(user);

  // Start the user at the correct position in the playing song.
  // We might need to be more advanced about this if it's too easy for
  // things to desynchronize.
  this.now.playAt(room.song.id, room.song.pos);
}

// A method for all users to report back where they are in a song
everyone.now.updatePosition = function(pos){

  // get the internal User object
  var user = Users[this.user.clientId];

  // if this user is further along than our last position, update
  // that position
  if (pos > user.room.song.pos) {
    user.room.song.pos = pos;
  }
};
