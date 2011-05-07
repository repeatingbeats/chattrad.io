
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
var everyone = require("now").initialize(app);


everyone.connected(function(){
  console.log("Joined: " + this.now.name);
});


everyone.disconnected(function(){
  console.log("Left: " + this.now.name);
});

everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};

