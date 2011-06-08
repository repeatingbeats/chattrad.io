
var testCase = require('nodeunit').testCase,
    Room = require('./../../lib/room'),
    RoomCtor = Room.Room,
    User = require('./../../lib/user'),
    testRoom = null;

exports['room'] = testCase({

  setUp: function testRoomSetup(start) {
    testRoom = new RoomCtor('testroom');
    start();
  },

  tearDown: function testRoomTearDown(finish) {
    testRoom = null;
    finish();
  },

  'public attributes after construction': {

    'name': function Room_name(test) {
      test.equal(testRoom.name, 'testroom');
      test.done();
    },

    'station': function Room_station(test) {
      test.strictEqual(testRoom.station, null);
      test.done();
    },

    'song': function Room_song(test) {
      test.strictEqual(testRoom.song, null);
      test.done();
    },

    'users': function Room_users(test) {
      test.deepEqual(testRoom.users, {});
      test.done();
    },

    'roomGroup': function Room_roomGroup(test) {
      // verify some top-level properties
      [ 'now',
        'connected',
        'disconnected',
        'addUser',
        'removeUser'
      ].forEach(function (prop) {
        test.ok(prop in testRoom.roomGroup,
                'roomGroup should have property: ' + prop);
      });
      test.done();
    }
  },

  'public methods': {

    'addClient': function (test) {
      console.log('XXX TODO: need now stubbing to test addClient');
      test.done();
    },

    'removeClient': function (test) {
      console.log('XXX TODO: need now stubbing to test removeClient');
      test.done();
    }

  },

});

exports['Exported Methods'] = {

  'createRoom': {

    'creates a new room': function (test) {
      var createdRoom = Room.createRoom('createRoom-created');
      test.equal(createdRoom.name, 'createRoom-created');
      test.done();
    },

    'throws if the room already exists': function (test) {
      var throwRoom = Room.createRoom('createRoom-throw');
      var throwFunc = function () {
        Room.createRoom('createRoom-throw');
      };
      test.throws(throwFunc, Error);
      test.done();
    }

  },

  'getRoom': {

    'returns null if the room does not exist': function (test) {
      var createdRoom = Room.getRoom('getRoom-created');
      test.equal(createdRoom, null);
      test.done();
    },

    'returns an existing room if the room exists': function (test) {
      var createdRoom = Room.createRoom('getRoom-exists');
      var sameRoom = Room.getRoom('getRoom-exists');
      test.equal(sameRoom, createdRoom);
      test.done();
    }

  }

}

