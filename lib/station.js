var stations = {},
    app = require('./../app.js'),
    lastfm = app.lastfm,
    echonest = app.echonest;

module.exports = {

  getStationForUser: function(username, callback) {

    console.log('getStationForUser:' + username);
    var station;

    if (username in stations) {
      console.log('calling back with cached station');
      callback(null, stations[username]);
    } else {
      console.log('creating new station');
      station = new Station(username);
      station.init(function(err) {
        callback(err, station);
      });
    }
  }

}

function Station(username) {
  this.song = null;
  this._username = username;
  this._catalog_id = null;
  this._playlist = [];
}

Station.prototype = {

  init: function (callback) {
    console.log('Station.init:' + this._username);
    var self = this;

    this._ensureCatalog({}, function (err) {
      if (err) return callback(err);
      self._getPlaylist({ results: 50 }, function (err, rdioIdArray) {
        if (err) return callback(err);
        self._playlist = rdioIdArray;
        stations[self._username] = self;
        callback();
      });
    });
  },

  next: function (callback) {
    if (this._playlist.length == 0) {
      // We should only get here if something broke. Punt.
    }
    var id = this._playlist.shift();
    this.song = { id: id, pos: 0 };
    callback(null, this.song)

    // Regenerate the playlist if empty.
    if (this._playlist.length == 0) {
      self._getPlaylist({ results: 100 }, function (err, rdioIdArray) {
        if (!err) self._playlist = rdioIdArray;
      });
    }
  },

  _getTopArtists: function (callback) {

    lastfm.request('user.getTopArtists', {
      user: this._username,
      handlers: {
        error: function (err) {
          callback(err);
        },
        success: function (data) {
          console.log(data);
          callback(null, JSON.parse(data).topartists.artist);
        }
      }
    });
  },

  _ensureCatalog: function (options, callback) {
    var self = this;
    echonest.apiCall('catalog', 'profile', {
      name: this._username
    }, function (err, res, body) {
      if (err) return callback(err);
      var json = JSON.parse(body);
      console.log(body);
      var catalog = json.response.catalog;
      if (!catalog || !(catalog.total > 0)) {
        self._getTopArtists(function (err, artistArray) {
          if (err) return callback(err);
          self._createCatalog({ type: 'artist-radio' }, function (err, res) {
            if (err) return callback(err);
            var used_ids = [];
            self._addToCatalog({
              id: res.id,
              items: artistArray.map(function (artist) {
                return { 'item': {
                  'item_id': artist.mbid,
                  'artist_name': artist.name
                }}
              }).filter(function(item) {
                var id = item['item']['item_id'];
                if (used_ids.indexOf(id) > -1) {
                  return false;
                } else {
                  used_ids.push(id);
                  return true;
                }
              })
            }, function (err, res) {
              if (err) return callback(err);
              callback(null, res);
            });
          });
        });
      } else {
        self._catalog_id = catalog.id;
        callback(null, {id: catalog.id});
      }
    });
  },

  _createCatalog: function (options, callback) {
    var self = this;
    echonest.apiCall('catalog', 'create', {
      name: this._username,
      type: options['type']
    }, function (err, res, body) {
      if (err) return callback(err);
      var json = JSON.parse(body);
      console.log(body);
      if (!json.response.id) return callback(new Error(body));
      self._catalog_id = json.response.id;
      callback(null, json.response);
    });
  },

  _addToCatalog: function (options, callback) {
    echonest.apiCall('catalog', 'update', {
      id: options['id'],
      data: JSON.stringify(options['items'])
    }, function (err, res, body) {
      if (err) return callback(err);
      var json = JSON.parse(body),
          ticket = json.response.ticket;
      console.log(body);
      if (!ticket) return callback(new Error(body));

      function wait() {
        echonest.apiCall('catalog', 'status', {
          ticket: ticket
        }, function (err, res, body) {
          if (err) return callback(err);
          var json = JSON.parse(body),
              status = json.response.ticket_status;
          console.log(body);

          if (!status) return callback(new Error(body));

          if (status == "complete") {
            callback(null, json.response);
          } else {
            // Catalog updates are slow. Don't pound the API
            // xxx slloyd This should really be abstracted away by the
            //            wrapper, with a callback on completion.
            setTimeout(function () { wait(); }, 2000);
          }
        });
      }

      wait();
    });
  },

  _getPlaylist: function (options, callback) {
    echonest.apiCall('playlist', 'static', {
      seed_catalog: this._catalog_id,
      limit: true,
      results: options['results'],
      buckets: ['tracks', 'id:rdio-us-streaming' ]
    }, function (err, res, body) {
      if (err) return callback(err);
      var json = JSON.parse(body),
          songs = json.response.songs;

      console.log(body);

      if (!songs) return callback(new Error(body));

      var rdio_ids = songs.map(function (song) {
        return song.foreign_ids &&
               song.foreign_ids[0] &&
               song.foreign_ids[0].foreign_id &&
               song.foreign_ids[0].foreign_id.split(':')[2];
      }).filter(function (id) {
        if (id) return true;
        else return false;
      });

      console.log(JSON.stringify(rdio_ids));
      callback(null, rdio_ids);
    });
  }
}

