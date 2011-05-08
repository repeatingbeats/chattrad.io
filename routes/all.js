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
    res.send('/rooms/' + req.params.id);
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

  app.get('/verify', function(req, res) {
    res.render('verify');
  });
};
