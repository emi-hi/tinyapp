const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//URL DATABASE
const urlDatabase = {
  "b2xVn2": { longUrl: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "b2xVn3": { longUrl: "http://www.cbc.ca", userId: "userRandomID" },
  "9sm5xK": { longUrl: "http://www.google.com", userId: "Emily" },
  "xxxxxx": { longUrl: "http://www.example.com", userId: "Emily" },
};



describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
    // Write your assert statement here
  });
  it('should return undefined for nonexistant emails', function() {
    const user = getUserByEmail(testUsers, "test@example.com");
    assert.isUndefined(user);
  });
});

describe('urlsForUser', function() {
  it('should return urls accessible to user', function() {
    const user = "userRandomID";
    const urlsAvailable = urlsForUser(user, urlDatabase);
    let expectedOutput = { b2xVn2: 'http://www.lighthouselabs.ca', b2xVn3: 'http://www.cbc.ca' };
    assert.deepEqual(expectedOutput, urlsAvailable);
  });
  it('should not return short urls that are not attached to the user', function() {
    const user = "userRandomID";
    const urlsAvailable = urlsForUser(user, urlDatabase);
    assert.notProperty(urlsAvailable,  "9sm5xK");
  });
});

