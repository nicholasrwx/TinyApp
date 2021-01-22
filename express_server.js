const express = require("express"); //Use Express
const bodyParser = require("body-parser"); //Convert Buffer info into a usable txt format
const cookieParser = require("cookie-parser");
//const status = require("status");
const app = express(); //express JS function redefined in variable form.
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//use bodyParser for everyhting?
app.use(bodyParser.urlencoded({ extended: true }));

//Allows express() function that is contained in variable 'app', to use cookieParser() function
app.use(cookieParser());

//allows client server interaction on specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//random string generator
const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

//If user is logged in or not
let loggedinUser;

//urlDatabase
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//USERS DataStore
const users = { };

//VALIDATOR for username and password
const validator = function (reqEmail, reqPassword, usr) {
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


const EmailError = function(reqEmail) {


  for (let user in users) {
if (users[user].email === reqEmail) { return true} 
} 
return false;
}

const PassError = function(reqPassword) {
for (let user in users) {
if (users[user].password === reqPassword) { return true};
}
return false;
}




//GET REQUESTS

//GET URLS INDEX page
app.get("/urls", (req, res) => {
  console.log(req.cookies["user_id"]);
  console.log(users);
  if (!req.cookies["user_id"]) {
    loggedinUser = null;
  } else {
    loggedinUser = users[req.cookies["user_id"]];
  }
  const templateVars = { urls: urlDatabase, username: loggedinUser };
  res.render("urls_index", templateVars);
});

//GET REGISTRATION page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null, error: null };
  res.render("registration", templateVars);
});

//GET LOGIN page
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null, error: null };
  res.render("login", templateVars);
});

//GET NEW URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: loggedinUser };
  res.render("urls_new", templateVars);
});

//GET URL SHOW page
app.get("/urls/:shortURL", (req, res) => {
  const u = "urls";
  const key = req.params.shortURL;
  const templateVars = {
    shortURL: key,
    longURL: urlDatabase[key],
    urls: u,
    username: loggedinUser,
  }; //urlDatabase?u
  res.render("urls_show", templateVars);
});

//GET CLICKABLE SHORT URL page (redirect to long url)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/*", (req, res) => {
  res.status(404);
  res.render("404");
});

//POST REQUESTS

//LOGIN
app.post("/login", (req, res) => {
  console.log(req.body);

  let reqEmail = req.body.email;
  let reqPassword = req.body.password;
  let data = validator(reqEmail, reqPassword);
  console.log(data);
  let usr = data;
  
  console.log(EmailError(reqEmail) === false);
  console.log(PassError(reqPassword) === false);

if (EmailError(reqEmail) === false && PassError(reqPassword) === true) {
  res.status(403);
  const templateVars = {
    urls: urlDatabase,
    username: null,
    error: "403 Error - Incorrect E-mail!",
  };
  res.render("login", templateVars);
} else if (PassError(reqPassword) === false && EmailError(reqEmail) === true) {
  res.status(403);
  const templateVars = {
    urls: urlDatabase,
    username: null,
    error: "403 Error - Incorrect Password!",
  };
  res.render("login", templateVars);
} else if (EmailError(reqEmail) === false && PassError(reqPassword) === false) {
  res.status(403);
  const templateVars = {
    urls: urlDatabase,
    username: null,
    error: "403 Error - E-mail and Password are Incorrect, Please Try Again!",
  };
  res.render("login", templateVars);
} else if (usr === true) {
    usr = validator(reqEmail, reqPassword, usr);
    res.cookie("user_id", usr);
    res.redirect("/urls");
  } else {
    console.log(users);
    res.redirect("/register");
    console.log(`user doesn't exist`);
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  console.log(req.body.name);
  //delete req.cookies["username"];
  res.clearCookie("user_id", req.body.name);
  console.log(req.body.name);
  res.redirect("/urls");
});

//REGISTRATION
app.post("/register", (req, res) => {
  //add user object to global users object
  let reqEmail = req.body.email;

  if (req.body.email === "" || req.body.password === "") {
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
    const RandomID = generateRandomString();
    console.log(RandomID);
    users[RandomID] = {
      id: RandomID,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie("user_id", RandomID);
    console.log(users);
    res.redirect("/urls");
  }
});

//GENERATE TINY URL
app.post("/urls", (req, res) => {
  const newurl = generateRandomString();
  urlDatabase[newurl] = req.body.longURL;
  res.redirect(`/urls/${newurl}`);
});

//DELETE URLS in database and req.params
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  delete req.params.shortURL;
  res.redirect("/urls");
});

//UPDATE A LONG URL
app.post("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls`);
});
