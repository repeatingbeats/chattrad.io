module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/rooms/:id', function (req, res) {
    res.send('/rooms/' + req.params.id);
  });
};
