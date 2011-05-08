var user = require('./../lib/user'),
    station = require('./../lib/station');

module.exports = function(app) {
  app.get('/', function(req, res) {
    if (!req.session.oauth_access_token) {
      app.Rdio.requestToken(function(err) {
                              console.log('rdio api call done bad. ' + err);
                            }, {}, function(data) {
                              // I'd put this in a for loop but I'm lazy.
                              req.session.oa = data.oa;
                              req.session.oauth_token = data.oauth_token;
                              req.session.oauth_token_secret = data.oauth_token_secret;

                              res.redirect('https://www.rdio.com/oauth/authorize?oauth_token=' +
                                           req.session.oauth_token);
                            });
    } else {
      res.render('index');
    }
  });

  app.get('/rooms/:id', function (req, res) {
    var room = req.params.id;
    if (app.Rooms[room]) {
      app.Rdio.request(function (err) {
        res.send(JSON.stringify({ 'oops, room-fail': err.data }));
      }, {
        method: 'currentUser',
        token: req.session.oauth_access_token,
        token_secret: req.session.oauth_access_token_secret ,
      }, function (data) {
        var userUrl = data.result.url.split('/');
        res.render('room', {username: userUrl[userUrl.length -2],
                            roomName: room});
      });
    } else {
      // create a room?
      res.send('YOU BROKE IT');
    }
  });

  // temporary test route
  app.get('/lfm/:id', function (req, res) {
    station.getStationForUser(req.params.id, function(err, station) {
      if (err) {
        res.send(err.message);
      } else {
        res.send(station._status);
      }
    });
  });

  app.post('/rooms', function (req, res) {
    var username = req.param('lastfm');
    console.log('posting username:' + username);
    station.getStationForUser(username, function(err, station) {
      var room
      if (username in app.Rooms) {
        room = app.Rooms[username];
      } else {
        room = new app.Room(username);
      }
      app.Rooms[username] = room;
      room.station = station;
      if (err) {
        res.send(err.message);
      } else {
        res.redirect('/rooms/' + username);
      }
    });
  });

  app.get('/flashvars', function (req, res) {
    var domain = app.set('domain');
    app.Rdio.request(function (err) {
      res.send(JSON.stringify({ 'oops': err.data }));
    }, {
      method: 'getPlaybackToken',
      domain: domain
    }, function (data) {
      var flashvars = {
        playbackToken: data.result,
        domain: domain
      };
      res.send(JSON.stringify(flashvars));
    });
  });

  app.get('/info', function(req, res) {
    app.Rdio.request(function(error) {
      console.log("ERRORINFO");
    },
    { method: 'get',
      keys: 't7349349',
      token: req.session.oauth_access_token,
      token_secret: req.session.oauth_access_token_secret },
      function(data) {
        res.send(data);
      });
  });

  app.get('/promo', function(req, res) {
    res.render('gohere');
  });

  app.get('/verify', function(req, res) {
    app.Rdio.accessToken(function(err) {
                           console.log('rdio access token gone bad. ' + err);
                           // should redirect somewhere here
                         },
                         { oauth_token: req.session.oauth_token,
                           oauth_token_secret: req.session.oauth_token_secret,
                           oauth_verifier: req.param('oauth_verifier') },
                         function(data) {
                           req.session.oauth_access_token = data.oauth_access_token;
                           req.session.oauth_access_token_secret =
                             data.oauth_access_token_secret;
                           app.Rdio.request(function(error) {
                                              // XXX - have to do something here
                                              console.log('ERR: ' + JSON.stringify(error));
                                            },
                                            { method: 'currentUser',
                                              token: req.session.oauth_access_token,
                                              token_secret:
                                                req.session.oauth_access_token_secret },
                                            function(data) {
                                              res.redirect('/');
                                            });
                         });
  });
};
