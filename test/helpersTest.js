const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "e4r5t6": {
    id: "e4r5t6", 
    email: "user1@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "p0o9i8": {
    id: "p0o9i8", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    const expectedOutput = {
      id: "e4r5t6", 
      email: "user1@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedOutput); 
  });

  it('should return undefined for invalid email', function() {
    const user = getUserByEmail("userX@example.com", testUsers)
    const expectedOutput = undefined
    assert.deepEqual(user, undefined); 
  });



});

