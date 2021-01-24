//VALIDATOR FOR USERNAME AND PASSWORD
const validator = function (email, currentPassword, users, usr) {
  for (let user in users) {
    if (email && currentPassword) {
      if (
        users[user].email === email &&
        users[user].password === currentPassword
      ) {
        if (usr === true) {
          return user;
        } else {
          return true;
        }
      }
    } else {
      if (users[user].email === email) {
        return email;
      }
    }
  }
  return null;
};

module.exports = validator;
