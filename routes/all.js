var station = require('./../lib/station');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index');
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

};
