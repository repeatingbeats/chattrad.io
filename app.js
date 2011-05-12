
var express = require('express'),
    jade = require('jade'),
    app = module.exports = express.createServer();

var DOTCLOUD_APP_PORT = 8080;

app.API_KEYS = require('./config/api_keys');

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
  app.set('domain', 'localhost');
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.Rdio = require('./lib/rdio').Rdio({
    key: app.API_KEYS['rdio']['key'],
    secret: app.API_KEYS['rdio']['secret'],
    cb: 'http://localhost:8080/verify'
  });
});

app.configure('development', function() {
  app.set('domain', 'localhost');
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.Rdio = require('./lib/rdio').Rdio({
    key: app.API_KEYS['rdio']['key'],
    secret: app.API_KEYS['rdio']['secret'],
    cb: 'http://localhost:8080/verify'
  });
});

app.configure('production', function() {
  app.set('domain', 'www.chattrad.io');
  app.use(express.errorHandler());
  app.Rdio = require('./lib/rdio').Rdio({
    key: app.API_KEYS['rdio']['key'],
    secret: app.API_KEYS['rdio']['secret'],
    cb: 'http://www.chattrad.io/verify'
  });
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

var check = require('validator').check,
    sanitize = require('validator').sanitize
everyone.now.distributeMessage = function(message){
  var user = Users[this.user.clientId];

  message = sanitize(message).trim();
  message = sanitize(message).xss();
  console.log(message);
  console.log((user));
  // make sure we have an internal user and room
  if (!user || !user.room) return;
  user.room.roomGroup.now.receiveMessage(user.username, message);
};

// Get the models we'll need
require('./lib/room.js');
require('./lib/user.js');
require('./lib/song.js');

// Maps of all Rooms and Users
app.Rooms = Rooms = {};
app.Users = Users = {};
app.Room = Room;

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
  if (!(this.user.clientId in Users)) {
    // If this user wasn't registered, register now
    this.now.registerUser();
  }
  user = Users[this.user.clientId];
  if (user.room) user.room.removeUser(user);

  // Add the user to our room and nowjs group
  room.addUser(user);
  this.now.broadcastJoin();

  // Start the user at the correct position in the playing song.
  // xxx slloyd Song position needs a magic number to incorporate delays:
  //            - client -> server transit for last reported pos
  //            - server -> client transit for playAt call
  //            - rdio flash player buffer/seek time
  this.now.playAt(room.station.song.id, room.station.song.pos + 3);
}

/**
 * \brief Broadcast user has joined room
 */
everyone.now.broadcastJoin = function() {
  everyone.now.receiveJoin(this.now.name);
}

everyone.now.updateUsers = function() {
  Users.forEach(function(user) {
    console.log(user);
  });
}

everyone.now.registerUser = function() {
  user = new User(this.now.name, this.user.clientId);
  Users[this.user.clientId] = user;
}

// A method for all users to report back where they are in a song
everyone.now.updatePosition = function(pos){

  // get the internal User object
  var user = Users[this.user.clientId];

  // if this user is further along than our last position, update
  // that position
  if (user && pos > user.room.station.song.pos) {
    user.room.station.song.pos = pos;
  }
};

// Clients report when they complete track playback
everyone.now.trackFinished = function(trackId) {

  var user = Users[this.user.clientId],
      station = user.room.station;

  // Ensure that we only call station.next() once
  if (trackId == station.song.id) {
    station.next(function (err, song) {
      everyone.now.playAt(song.id, 0);
    });
  }
}

