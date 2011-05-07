module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/rooms/:id', function (req, res) {
    res.send('/rooms/' + req.params.id);
  });

  // temporary test route
  app.get('/lfm/:id', function (req, res) {
    var username = req.params.id;

    app.lastfm.request('user.getTopTracks', {
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

};
