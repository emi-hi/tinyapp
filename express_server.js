const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const bcrypt = require('bcrypt');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "Emily": {
    id: "Emily",
    email: "em@em.com",
    password: "test"
  }
};

const urlDatabase = {
  "b2xVn2": { longUrl: "http://www.lighthouselabs.ca", userId: "aJ48lW" },
  "b2xVn3": { longUrl: "http://www.cbc.ca", userId: "aJ48lW" },
  "9sm5xK": { longUrl: "http://www.google.com", userId: "Emily" },
  "xxxxxx": { longUrl: "http://www.example.com", userId: "Emily" },
};

const getIDFromEmail = (obj,val) => Object.keys(obj).find(key => obj[key]["email"] === val);

const urlsForUser = function(user) {
  let urlsToDisplay = {};
  const shortUrlsArr = (obj,val) => Object.keys(obj).filter(key => obj[key]["userId"] === val);
  let arr = shortUrlsArr(urlDatabase, user);
  for (let i of arr) {
    urlsToDisplay[i] = urlDatabase[i]["longUrl"];
  }
  return urlsToDisplay;
}

//returns true if the email is in the system
const checkEmailExists = function(email, password) {
  const theEmail = getIDFromEmail(users, email);
  if (theEmail === undefined) {
    return false;
  }
  return true;
};

const generateRandomString = function(max) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < max; i++) {
    result += chars[(Math.floor(Math.random() * chars.length))];
  }
  return result;
};

app.set("view engine", "ejs");


//------------------------------
//   GET
//------------------------------
//main page / index
app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  }
  res.redirect("/urls");
});

// URLS index
app.get("/urls", (req, res) => {
  // if the user is not logged in, redirect to the login page
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  }
  // else show the urls connected to that user
  urlsToDisplay = urlsForUser(req.session.user_id["id"]);
  let templateVars = { urls: urlsToDisplay, user_id: req.session.user_id };
  res.render("urls_index", templateVars);
});

//register username
app.get("/urls/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("register", templateVars);
});

//register username
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("login", templateVars);
});

// add a new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.session.user_id };
  if (templateVars["user_id"] === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

// error!
app.get("/urls/error", (req, res) => {
  let templateVars = { user_id: req.session.user_id };
  res.render("error", templateVars);
});
//login error
app.get("/loginError", (req, res) => {
  res.render("error_login");
});

//reg error
app.get("/regError", (req, res) => {
  res.render("error_reg");
});

//if user goes to the shortened URL, redirect to the long version!
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]["longUrl"]);
});

// page with info on specific URL! Short and long
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id !== undefined) {
    urlsToDisplay = urlsForUser(req.session.user_id["id"]);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlsToDisplay[req.params.shortURL], user_id: req.session.user_id };
      res.render("urls_show", templateVars);
    }
  }
    res.status(404)
    res.redirect('/urls/error')
});

//------------------------------
// POST
//------------------------------

// add a new username
app.post("/urls/register", (req, res) => {
  let newEmail = req.body["email"];
  let userPass = req.body["password"]
  if (newEmail === '' | userPass === '' | checkEmailExists(newEmail)) {
    res.redirect('/regError');
  }
  let id = generateRandomString(10);
  let hashedPass = bcrypt.hashSync(userPass, 10)
  users[id] = {
        id: id,
        email: newEmail,
        password: hashedPass
        };
  req.session.user_id = users[id];
  res.redirect(`/urls/`);
});

// LOGOUT USER
app.post("/urls/logout", (req, res) => {
  req.session = null
  res.redirect("/login");
});

//when a user logs in, redirect to the homepage!
app.post("/login", (req, res) => {
  let email = req.body["email"];
  let userPass = req.body["password"];
  if (checkEmailExists(email)) {
    let id = getIDFromEmail(users, email);
    if (bcrypt.compareSync(userPass, users[id]["password"])) {
      req.session.user_id = users[id];
      res.redirect('/urls');
    }
  }
  res.redirect('/loginError');
});

//create shortened string and redirect!
app.post("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const shortened = generateRandomString(6);
    urlDatabase[shortened] = {
      longUrl: req.body["longURL"],
      userId: req.session.user_id["id"]
    }
    res.redirect(`/urls/${shortened}`);
  }
  res.redirect('/urls/error')
});

// EDIT THE LONG VERSION OF URL
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id !== undefined) {
    urlsToDisplay = urlsForUser(req.session.user_id["id"]);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      const shortURL = req.params.shortURL;
      const longURL = req.body["longURL"];
      urlDatabase[shortURL] = {
        longUrl: longURL, 
        userId: req.session.user_id["id"]
      };
      res.redirect(`/urls/${shortURL}`);
  }
  res.status(404)
  res.redirect('/urls/error')
  }
});

// DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id !== undefined) {
    urlsToDisplay = urlsForUser(req.session.user_id["id"]);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      delete urlDatabase[req.params.shortURL];
      res.redirect(`/urls`);
    }
  }
  res.status(404)
  res.redirect('/urls/error')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

