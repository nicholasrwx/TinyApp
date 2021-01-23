const express = require("express");
const bodyParser = require("body-parser"); //Convert Buffer info into a usable txt format
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;
let loggedinUser;

app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],

    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

///
///
//DATABASES
///
///

//URLDATABASE
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", UserID: "admin" },
  "9sm5xK": { longURL: "http://www.google.com", UserID: "admin" },
};

//USER DATABASE
const users = {
  admin: {
    id: "admin",
    email: "admin@tinyapp.com",
    password: "$2b$10$s/WpVMzSMWVQSstkJiHE9OV3j6voeHb4NN/M/9iW3V3e7tVUdNdli",
  },
};

///
///
///
//HELPER FUNCTIONS
///
///
///

//RANDOM STRING GENERATOR
const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};
//VALIDATOR FOR USERNAME AND PASSWORD
const validator = function (reqEmail, reqPassword, usr) {
  console.log(reqPassword);
  for (let user in users) {
    if (reqEmail && reqPassword) {
      if (
        users[user].email === reqEmail &&
        users[user].password === reqPassword
      ) {
        if (usr === true) {
          return user;
        } else {
          return true;
        }
      }
    } else {
      if (users[user].email === reqEmail) {
        return reqEmail;
      }
    }
  }
  return null;
};

//EMAIL SPELL CHECKER - FOR ERROR RESPONSES
const EmailError = function (reqEmail) {
  for (let user in users) {
    if (users[user].email === reqEmail) {
      return true;
    }
  }
  return false;
};

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

//FINDS HASHED PASSWORD FOR COMPARISON
const validator2 = function (reqEmail) {
  for (let user in users) {
    if (reqEmail === users[user].email) {
      return users[user].password;
    }
  }
  return false;
};

///
///
///
//GET REQUESTS
///
///
///

//TINY APP PAGE
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase, username: loggedinUser };
  res.render("homepage", templateVars);
});

//URLS PAGE
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    loggedinUser = null;
  } else {
    loggedinUser = req.session.user_id;
  }

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    username: loggedinUser,
    error: null,
  };
  res.render("urls_index", templateVars);
});

//GET REGISTRATION PAGE
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null, error: null };
  res.render("registration", templateVars);
});

//GET LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null, error: null };
  res.render("login", templateVars);
});

//GET NEW URL PAGE
app.get("/urls/new", (req, res) => {
  if (loggedinUser !== null && loggedinUser !== undefined) {
    const templateVars = { urls: urlDatabase, username: loggedinUser };
    res.render("urls_new", templateVars);
  }

  res.redirect(`/login`);
});

//GET URL SHOW PAGE
app.get("/urls/:shortURL", (req, res) => {
  const u = "urls";
  const key = req.params.shortURL;
  const templateVars = {
    shortURL: key,
    longURL: urlDatabase[key]["longURL"],
    urls: u,
    username: loggedinUser,
    error: null,
  }; //urlDatabase?u
  res.render("urls_show", templateVars);
});

//GET LONG URL PAGE - VIA - CLICKABLE SHORT LINK
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//ERROR PAGE
app.get("/*", (req, res) => {
  res.status(404);
  res.render("404");
});

///
///
//POST REQUESTS
///
///

//LOGIN
app.post("/login", (req, res) => {
  let reqEmail = req.body.email;
  let password = req.body.password; //txt password
  let currentPassword = validator2(reqEmail); //find hash version of password
  console.log(currentPassword);
  let comparedPass = false;
  if (currentPassword !== false) {
    comparedPass = bcrypt.compareSync(password, currentPassword);
  }
  console.log(users);
  console.log(currentPassword);

  let usr = validator(reqEmail, currentPassword);

  if (EmailError(reqEmail) === false && comparedPass === false) {
    //if email is wrong, and password is wrong, return msg below
    res.status(403); //if a field is emply do this.
    const templateVars = {
      urls: urlDatabase,
      username: null,
      error: "403 Error - E-mail and Password are Incorrect, Please Try Again!",
    };
    res.render("login", templateVars);
  } else if (EmailError(reqEmail) === false && password !== "") {
    //if email is wrong, and password field isnt empty, return incorrect email
    res.status(403);
    const templateVars = {
      urls: urlDatabase,
      username: null,
      error: "403 Error - Incorrect E-mail!",
    };
    res.render("login", templateVars);
  } else if (comparedPass === false && EmailError(reqEmail) === true) {
    //if password is wrong but email is right, return message
    res.status(403);
    const templateVars = {
      urls: urlDatabase,
      username: null,
      error: "403 Error - Incorrect Password!",
    };
    res.render("login", templateVars);
  } else if (usr === true) {
    //if everything is correect and user exists, create cookie and start sesion
    usr = validator(reqEmail, currentPassword, usr);
    req.session.user_id = usr;
    res.redirect("/urls");
  } else {
    //otherwise send to registration page.
    res.redirect("/register");
    console.log(`user doesn't exist`);
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTRATION
app.post("/register", (req, res) => {
  let reqEmail = req.body.email;
  let password = req.body.password;

  if (req.body.email === "" || password === "") {
    res.status(400);
    const templateVars = {
      urls: urlDatabase,
      username: null,
      error: "400 Error - Fields Cannot Be Blank",
    };
    res.render("registration", templateVars);
  } else if (req.body.email === validator(reqEmail)) {
    res.status(400);
    const templateVars = {
      urls: urlDatabase,
      username: null,
      error: "400 Error - Username Unavailable",
    };
    res.render("registration", templateVars);
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const RandomID = generateRandomString();

    users[RandomID] = {
      id: RandomID,
      email: req.body.email,
      password: hashedPassword,
    };
    req.session.user_id = RandomID;
    res.redirect("/urls");
  }
});

//GENERATE TINY URL
app.post("/urls", (req, res) => {
  const newurl = generateRandomString();
  urlDatabase[newurl] = {
    longURL: req.body.longURL,
    UserID: req.session.user_id,
  };
  res.redirect(`/urls/${newurl}`);
});

//DELETE URLS IN DATABASE && REQ.PARAMS
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  const u = "urls";
  const templateVars = {
    shortURL: key,
    longURL: urlDatabase[key]["longURL"],
    urls: u,
    username: loggedinUser,
    error: "Permission Denied",
  };

  if (req.session.user_id === urlDatabase[key]["UserID"]) {
    const key = req.params.shortURL;
    delete urlDatabase[key];
    delete req.params.shortURL;
    res.redirect("/urls");
  }

  res.status(403);
  res.render(`urls_index`, templateVars);
});

//UPDATE A LONG URL
app.post("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const u = "urls";
  const templateVars = {
    shortURL: key,
    longURL: urlDatabase[key]["longURL"],
    urls: u,
    username: loggedinUser,
    error: "Permission Denied",
  };

  if (req.session.user_id === urlDatabase[key]["UserID"]) {
    urlDatabase[key]["longURL"] = req.body.longURL;
    res.redirect(`/urls`);
  }

  res.status(403);
  res.render(`urls_show`, templateVars);
});
