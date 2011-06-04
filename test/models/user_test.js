
var testCase = require('nodeunit').testCase,
    User = require('./../../lib/user'),
    testUser = null;

exports['User'] = testCase({

  setUp: function testUserSetup(start) {
    testUser = User.createUser('testname');
    start();
  },

  tearDown: function testUserTearDown(finish) {
    testUser = null;
    finish();
  },

  'public attributes after construction': {

    'username': function User_username(test) {
      test.equal(testUser.username, 'testname');
      test.done();
    },

    'clients': function User_clients(test) {
      test.deepEqual(testUser.clients, {});
      test.done();
    }

  },

  'pseudo-private methods': {

    '_ensureClient': function User__ensureClient(test) {
      testUser._ensureClient('test-id');
      test.deepEqual(testUser.clients, { 'test-id': [] });
      test.done();
    }

  }

});

exports['Exported Methods'] = {

  'createUser': {

    'creates new user if username does not exist': function (test) {
      var createdUser = User.createUser('createUser-created');
      test.ok(createdUser);
      test.done();
    },

    'adds optional attributes': function (test) {
      var options = { 'a': 1, 'b': 2, 'c': false },
          createdUser = User.createUser('createUser-options', options);
      for (var option in options) {
        test.equal(createdUser[option], options[option]);
      }
      test.done();
    },

    'stores the user': function (test) {
      var createdUser = User.createUser('createUser-store'),
          duplicateUser = User.createUser('createUser-store');
      test.strictEqual(duplicateUser, createdUser);
      test.done();
    }

  },

  'getUser': {

    'gets an existing user': function (test) {
      var newUser = User.createUser('getUser-existing'),
          existingUser = User.getUser('getUser-existing');
      test.strictEqual(existingUser, newUser);
      test.done();
    },

    'ensures clients if passed a client id': function (test) {
      var newUser = User.createUser('getUser-clients'),
          getUser = User.getUser('getUser-clients', 'getUser-client-id');
      test.deepEqual(getUser.clients['getUser-client-id'], []);
      test.done();
    }
  }
};

