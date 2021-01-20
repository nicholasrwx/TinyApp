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

//index page 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//generate random tiny URL and redirect to urls show
app.post("/urls", (req, res) => {
  const newurl = generateRandomString();
  urlDatabase[newurl] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${newurl}`);
});

//create new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//delete urls in database and req.params
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  console.log(urlDatabase);
  delete urlDatabase[key];
  delete req.params.shortURL;
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  res.redirect("/urls");
});

//displays newly created shortURL in a clickable link format
app.get("/urls/:shortURL", (req, res) => {
  const u = "urls";
  const key = req.params.shortURL;
  const templateVars = { shortURL: key, longURL: urlDatabase[key], urls: u }; //urlDatabase?u
  res.render("urls_show", templateVars);
});

//makes the clickable shortURL link even shorter, and redirects to the associated long url page.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//prints hello in browser
app.get("/", (req, res) => {
  res.send("Hello!");
});

//prints urlDatabase in json format in the browser
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//inline html string sent that the browser will render upon receiving this response
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//allows client server interaction on specified port 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
