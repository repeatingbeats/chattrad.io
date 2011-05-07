
var express = require('express'),
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

app.get('/', function(req, res) {
  res.send('<h1>GIANT HACK IN PROGRESS</h1>');
});

app.get('/rooms/:id', function (req, res) {
  res.send('/rooms/' + req.params.id);
});

app.get('/lfm/:id', function (req, res) {
  var username = req.params.id,
      request = app.lastfm.request('user.getTopTracks', {
        user: username,
        handlers: {
          success: function(data) {
            res.send(data);
          },
          error: function(error) {
            res.send(error.message);
          }
        }
      });
});

if (!module.parent) {
  app.listen(DOTCLOUD_APP_PORT);
  console.log("express server listening on port %d, env: %s",
              app.address().port,
              app.settings.env);
}

