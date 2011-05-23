
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

  'public attributes': {

    'username': function User_username(test) {
      test.done();
    },

    'clients': function User_clients(test) {
      test.done();
    }

  },

  'pseudo-private methods': {

    '_ensureClient': function User__ensureClient(test) {
      test.done();
    }

  }

});

