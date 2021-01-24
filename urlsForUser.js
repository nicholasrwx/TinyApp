//FIND USER SPECIFIC URLs by USERID
const urlsForUser = function (id, urlDatabase) {
  let shortList = {};

  for (let short in urlDatabase) {
    if (urlDatabase[short]["UserID"] === id) {
      shortList[short] = urlDatabase[short]["longURL"];
    }
  }

  if (Object.entries(shortList).length === 0) {
    return false;
  } else {
    return shortList;
  }
};

module.exports = urlsForUser;