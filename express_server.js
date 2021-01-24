const hashLookup = require("./hashLookup");
const urlsForUser = require("./urlsForUser");
const validator = require("./validator");
const checkUserEmail = require("./helpers");
const express = require("express");
const bodyParser = require("body-parser"); //Convert Buffer info into a usable txt format
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;
let loggedinUser;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

//RANDOM STRING GENERATOR
const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

//GET REQUESTS

//TINY APP PAGE
app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userstatus: loggedinUser,
  };
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
    users: users,
    userstatus: loggedinUser,
    error: null,
  };
  res.render("urls_index", templateVars);
});

//GET REGISTRATION PAGE
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userstatus: null,
    error: null,
  };
  res.render("registration", templateVars);
});

//GET LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userstatus: null,
    error: null,
  };
  res.render("login", templateVars);
});

//GET NEW URL PAGE
app.get("/urls/new", (req, res) => {
  if (loggedinUser !== null && loggedinUser !== undefined) {
    const templateVars = {
      urls: urlDatabase,
      users: users,
      userstatus: loggedinUser,
    };
    res.render("urls_new", templateVars);
  } else {
  res.redirect(`/login`);
  }
});

//GET URL SHOW PAGE
app.get("/urls/:shortURL", (req, res) => {
  const u = "urls";
  const key = req.params.shortURL;
  const templateVars = {
    shortURL: key,
    longURL: urlDatabase[key]["longURL"],
    urls: u,
    users: users,
    userstatus: loggedinUser,
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
const templateVars = {
  urls: urlDatabase,
  users: users,
  userstatus: null,
  error: ""
};

//LOGIN
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let currentPassword = hashLookup(email, users);
  let comparedPass = false;
  if (currentPassword !== false) {
    comparedPass = bcrypt.compareSync(password, currentPassword);
  }
  let usr = validator(email, currentPassword, users);

  if (email === "" && password === "") {
    res.status(403);
    res.redirect("/register");
  } else if (email !== "" && password === "") {
    res.status(403);
      templateVars.error = "Please Enter A Password!";
    res.render("login", templateVars);
  } else if (email === "" && password !== "") {
    res.status(403);
      templateVars.error = "Please Enter A E-mail!";
    res.render("login", templateVars);
  } else if (checkUserEmail(email, users) === false && password !== "") {
    res.status(403);
      templateVars.error = "Incorrect E-mail! Please Register, or try again!";
    res.render("login", templateVars);
  } else if (checkUserEmail(email, users) === true && comparedPass === false) {
    res.status(403);
    templateVars.error = "Incorrect Password!";
    res.render("login", templateVars);
  } else {
    usr = validator(email, currentPassword, users, usr);
    req.session.user_id = usr;
    res.redirect("/urls");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTRATION
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (req.body.email === "" || password === "") {
    res.status(400);
      templateVars.error = "400 Error - Fields Cannot Be Blank";
    res.render("registration", templateVars);
  } else if (checkUserEmail(email, users) === true) {
    res.status(400);
      templateVars.error = "User unavailable";
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
    users: users,
    userstatus: loggedinUser,
    error: "Permission Denied",
  };

  if (req.session.user_id === urlDatabase[key]["UserID"]) {
    const key = req.params.shortURL;
    delete urlDatabase[key];
    delete req.params.shortURL;
    res.redirect("/urls");
  } else {
     res.status(403);
  res.render(`urls_index`, templateVars);
  }
});

//UPDATE A LONG URL
app.post("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const u = "urls";
  const templateVars = {
    shortURL: key,
    longURL: urlDatabase[key]["longURL"],
    urls: u,
    users: users,
    userstatus: loggedinUser,
    error: "Permission Denied",
  };

  if (req.session.user_id === urlDatabase[key]["UserID"]) {
    urlDatabase[key]["longURL"] = req.body.longURL;
    res.redirect(`/urls`);
  } else {
  res.status(403);
  res.render(`urls_show`, templateVars);
  }
});
