var express = require('express'),
    jade = require('jade'),
    app = module.exports = express.createServer();

// Models
var room = require('./lib/room.js'),
    user = require('./lib/user.js'),
    song = require('./lib/song.js');

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
  //console.log("Joined: " + this.now.name);
});

everyone.disconnected(function(){
  //console.log("Left: " + this.now.name);
});

var check = require('validator').check,
    sanitize = require('validator').sanitize

everyone.now.distributeMessage = function(message) {
  var currUser = user.getUser(this.user.clientId),
      currRoom = room.getRoom(this.now.room);

  message = sanitize(message).trim();
  message = sanitize(message).xss();
  console.log(currUser.username + ' - ' + message);

  currRoom.roomGroup.now.receiveMessage(currUser.username, message);
};

/* A join method for every client */
everyone.now.join = function(roomname) {
  var currRoom = room.getRoom(roomname),
      currUser = user.getUser(this.user.clientId);

  this.now.room = roomname;

  currUser.username = this.now.name;

  // Add the user to our room and nowjs group
  currRoom.addUser(currUser);

  // Start the user at the correct position in the playing song.
  // xxx slloyd Song position needs a magic number to incorporate delays:
  //            - client -> server transit for last reported pos
  //            - server -> client transit for playAt call
  //            - rdio flash player buffer/seek time
  this.now.playAt(currRoom.station.song.id, currRoom.station.song.pos + 3);
}

everyone.now.leave = function(roomname) {
  var currRoom = room.getRoom(roomname),
      currUser = user.getUser(this.user.clientId);

  // XXX - https://github.com/Flotype/now/issues/37
  //   TypeError: Cannot read property '0' of null
  // Should be fixed in a later version, although I'm not convinced 6.0 is
  // stable.
  this.now.room = null;

  // Remove the user from the room and nowjs group
  currRoom.removeUser(currUser);
}

// A method for all users to report back where they are in a song
everyone.now.updatePosition = function(pos) {
  var currUser = user.getUser(this.user.clientId),
      currRoom = room.getRoom(this.now.room);

  // if this user is further along than our last position, update
  // that position
  if (currUser && pos > currRoom.station.song.pos) {
    currRoom.station.song.pos = pos;
  }
};

// Clients report when they complete track playback
everyone.now.trackFinished = function(trackId) {
  var currUser = user.getUser(this.user.clientId),
      currRoom = room.getRoom(this.now.room),
      currStation = currRoom.station;

  // Ensure that we only call station.next() once
  if (trackId == currStation.song.id) {
    currStation.next(function (err, song) {
      everyone.now.playAt(song.id, 0);
    });
  }
}

