const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function () {
return Math.random().toString(36).substr(2, 6); 
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//this route handler sends our url database to our EJS template
//the order of router definitions matter
//they need to be above the :shortURL ... this one will look up the url always
//therefore you will never get to your other pages
//rule of thumb: order from most basic routes, to least specific routes

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newurl = generateRandomString();
  urlDatabase[newurl] = req.body.longURL;
  console.log(urlDatabase);
  res.send('Ok');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const key = req.params.shortURL;
  const templateVars = { shortURL: key, longURL: urlDatabase[key] }; //urlDatabase?u
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
