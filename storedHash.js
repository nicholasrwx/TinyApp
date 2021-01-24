//FINDS HASHED PASSWORD FOR COMPARISON
const storedHash = function(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user].password;
    }
  }
  return false;
};

module.exports = storedHash;