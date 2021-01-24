const { assert } = require('chai');
const CheckUserEmail  = require('../helpers.js');


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

 const users = testUsers;

describe('getUserByEmail', function() {
  it('should find a user with a matching email', function() {
   
    const user = CheckUserEmail("user@example.com", users)
    const expectedOutput = true;
    assert.strictEqual(user, expectedOutput, 'User E-mail Matches Email in Database')  
  });
  it('should return false if no emails match', function() {
   
    const user = CheckUserEmail("nonexistent@example.com", users)
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput, `User E-mail doesn't exist in the database.`);  
  });

});

