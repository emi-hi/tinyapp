const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
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
const validateEmail = function(email, password) {
  if (email === '' | password === '') {
    return false;
  } else {
    const theEmail = getIDFromEmail(users, email);
    if (theEmail === undefined) {
      return false;
    }
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
  res.send("Hello!");
});

// URLS index
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.redirect('/login');
  }
  urlsToDisplay = urlsForUser(req.cookies["user_id"]["id"]);
  let templateVars = { urls: urlsToDisplay, user_id: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

//register username
app.get("/urls/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("register", templateVars);
});

//register username
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("login", templateVars);
});

// add a new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"] };
  if (templateVars["user_id"] === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

//if user goes to the shortened URL, redirect to the long version!
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]["longUrl"]);
});

// page with info on specific URL! Short and long
app.get("/urls/:shortURL", (req, res) => {
  urlsToDisplay = urlsForUser(req.cookies["user_id"]["id"]);
  if (urlsToDisplay[req.params.shortURL] === undefined) {
    res.status(404)
    res.send("Page not found!")
  }
  let templateVars = { shortURL: req.params.shortURL, longURL: urlsToDisplay[req.params.shortURL], user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

//------------------------------
// POST
//------------------------------

// add a new username
app.post("/urls/register", (req, res) => {
  let newEmail = req.body["email"];
  if (!validateEmail(newEmail)) {
    let id = generateRandomString(10);
    let userPass = req.body["password"]
    let hashedPass = bcrypt.hashSync(userPass, 10)
    users[id] = {
      id: id,
      email: newEmail,
      password: hashedPass
    };
    res.cookie("user_id", users[id]);
    res.redirect(`/urls/`);
  } else {
    res.status(400)
      .send('400: Please enter a valid email/password');
  }
});

// LOGOUT USER
app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
//when a user logs in, redirect to the homepage!
app.post("/login", (req, res) => {
  let email = req.body["email"];
  let userPass = req.body["password"];
  if (validateEmail(email)) {
    let id = getIDFromEmail(users, email);
    if (bcrypt.compareSync(userPass, users[id]["password"])) {
      res.cookie("user_id", users[id]);
      res.redirect('/urls');
    }
  }
  res.status(400)
    .send('400: Please enter a valid email/password');
});

//create shortened string and redirect!
app.post("/urls", (req, res) => {
  const shortened = generateRandomString(6);
  urlDatabase[shortened] = {
    longUrl: req.body["longURL"],
    userId: req.cookies["user_id"]["id"]
  }
  res.redirect(`/urls/${shortened}`);

});

// EDIT THE LONG VERSION OF URL
app.post("/urls/:shortURL/edit", (req, res) => {
  urlsToDisplay = urlsForUser(req.cookies["user_id"]["id"]);
  if (urlsToDisplay[req.params.shortURL] === undefined) {
    res.status(404)
    res.send("Page not found!")
  }
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  urlDatabase[shortURL] = {
    longUrl: longURL, 
    userId: req.cookies["user_id"]["id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

// DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  // delete urlDatabase[]
  urlsToDisplay = urlsForUser(req.cookies["user_id"]["id"]);
  if (urlsToDisplay[req.params.shortURL] === undefined) {
    res.status(404)
    res.send("Page not found!")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

