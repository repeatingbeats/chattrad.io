var user = require('./../lib/user'),
    room = require('./../lib/room'),
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
    var currRoom = room.getRoom(req.params.id);
    if (currRoom) {
      app.Rdio.request(function(err) {
        res.send(JSON.stringify({ 'oops, room-fail': err.data }));
      }, {
        method: 'currentUser',
        token: req.session.oauth_access_token,
        token_secret: req.session.oauth_access_token_secret ,
      }, function (data) {
        var userUrl = data.result.url.split('/');
        res.render('room', { username: userUrl[userUrl.length -2],
                             roomname: currRoom.name });
      });
    } else {
      // create a room?
      res.send('YOU BROKE IT');
    }
  });

  app.post('/rooms', function (req, res) {
    var username = req.param('lastfm');
    console.log('posting username:' + username);
    station.getStationForUser(username, function(err, currStation) {
      var currRoom;

      if (err) {
        return res.send(err.message);
      }

      currRoom = room.getRoom(username);
      currRoom.station = currStation;

      currStation.next(function (err, id) {
        if (err) {
          return res.send(err.message)
        }

        res.redirect('/rooms/' + username);
      });
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

  app.get('/info/:id', function(req, res) {
    var key = req.params.id;
    app.Rdio.request(function(error) {
      console.log("ERRORINFO");
    },
    { method: 'get',
      keys: key,
      token: req.session.oauth_access_token,
      token_secret: req.session.oauth_access_token_secret },
      function(data) {
        res.send(JSON.stringify(data));
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
