const express = require("express"); //Use Express
const bodyParser = require("body-parser"); //Convert Buffer info into a usable txt format
const cookieParser = require("cookie-parser");
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

//urlDatabase
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//USERS DataStore

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//GET REQUESTS
let loggedinUser
//GET URLS INDEX page
app.get("/urls", (req, res) => {
  
  console.log(req.cookies['user_id']);
  
  if (!req.cookies['user_id']){
 loggedinUser = null;   
  } else { 
    loggedinUser = users[req.cookies['user_id']]
  }
  const templateVars = { urls: urlDatabase, username: loggedinUser };
  res.render("urls_index", templateVars);
});

//GET REGISTRATION page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null };
  res.render("registration", templateVars);
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
    username: loggedinUser
  }; //urlDatabase?u
  res.render("urls_show", templateVars);
});

//GET CLICKABLE SHORT URL page (redirect to long url)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//GET hello
app.get("/", (req, res) => {
  const username = req;
  console.log(username);
});

//GET URLDATABASE info
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET hello, in-line html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//POST REQUESTS

//LOGIN
app.post("/login", (req, res) => {
  console.log(req.body.name);
  console.log(users[req.body.name]);
  let Object1 = {} 
  for (let user in users) {
         if (users[user].email === req.body.name) {
        Object1 = users[user];
        
        break; 
        } 
        }                    
  if (Object.keys(Object1).length !== 0) {
    console.log(Object1);
    res.cookie("user_id", Object1.id);
    res.redirect("/urls");
  } else {
    //redirect you to register
    //console.log(req.body.name);
    //res.cookie("username", req.body.name);
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
