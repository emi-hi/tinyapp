const express = require("express");
const app = express();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const PORT = 8080; // default port 8080
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
      
// USER DATABASE
let users = {
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
};

//URL DATABASE
let urlDatabase = {
  "b2xVn2": { longUrl: "http://www.lighthouselabs.ca", userId: "aJ48lW" },
  "b2xVn3": { longUrl: "http://www.cbc.ca", userId: "aJ48lW" },
  "9sm5xK": { longUrl: "http://www.google.com", userId: "Emily" },
  "xxxxxx": { longUrl: "http://www.example.com", userId: "Emily" },
};

app.set("view engine", "ejs");


//------------------------------
//   GET
//------------------------------
//main page / index
app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

// URLS index
app.get("/urls", (req, res) => {
  // if the user is not logged in, redirect to the login page
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  }
  // else show the urls connected to that user
  const urlsToDisplay = urlsForUser(req.session.user_id["id"], urlDatabase);
  const templateVars = { urls: urlsToDisplay, user_id: req.session.user_id };
  res.render("urls_index", templateVars);
});

//register username
app.get("/urls/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("register", templateVars);
});

//register username
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("login", templateVars);
});

// add a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  if (templateVars["user_id"] === undefined) {
    res.redirect("/login");
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
  if (req.session.user_id !== undefined) {
    const urlsToDisplay = urlsForUser(req.session.user_id["id"], urlDatabase);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      const templateVars = { shortURL: req.params.shortURL, longURL: urlsToDisplay[req.params.shortURL], user_id: req.session.user_id };
      res.render("urls_show", templateVars);
    }
  }
  res.status(401);
  res.redirect("/error");
});

/* 
.......
Errors
.......
*/
// error for if page doesn't exist or they don't have access
app.get("/error", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  res.render("error", templateVars);
});
// login error
app.get("/loginError", (req, res) => {
  res.render("error_login");
});

// registration error
app.get("/regError", (req, res) => {
  res.render("error_reg");
});

//------------------------------
// POST
//------------------------------

// add a new username
app.post("/urls/register", (req, res) => {
  const newEmail = req.body["email"];
  const userPass = req.body["password"];
  if (newEmail === "" | userPass === "" | getUserByEmail(users, newEmail) !== undefined) {
    res.redirect("/regError");
  }
  const id = generateRandomString(10);
  const hashedPass = bcrypt.hashSync(userPass, 10);
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
  req.session = null;
  res.redirect("/login");
});

//when a user logs in, redirect to the homepage!
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const userPass = req.body["password"];
  if (getUserByEmail(users, email) !== undefined) {
    const id = getUserByEmail(users, email);
    if (bcrypt.compareSync(userPass, users[id]["password"])) {
      req.session.user_id = users[id];
      res.redirect("/urls");
    }
  }
  res.redirect("/loginError");
});

//create shortened string and redirect!
app.post("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const shortened = generateRandomString(6);
    urlDatabase[shortened] = {
      longUrl: req.body["longURL"],
      userId: req.session.user_id["id"]
    };
    res.redirect(`/urls/${shortened}`);
  }
  res.status(401);
  res.redirect("/error");
});

// EDIT THE LONG VERSION OF URL
app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id !== undefined) {
    const urlsToDisplay = urlsForUser(req.session.user_id["id"], urlDatabase);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      const shortURL = req.params.shortURL;
      const longURL = req.body["longURL"];
      urlDatabase[shortURL] = {
        longUrl: longURL,
        userId: req.session.user_id["id"]
      };
      res.redirect(`/urls/${shortURL}`);
    }
    res.status(401);
    res.redirect("/error");
  }
});

// DELETE URL
app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.user_id !== undefined) {
    const urlsToDisplay = urlsForUser(req.session.user_id["id"], urlDatabase);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      delete urlDatabase[req.params.shortURL];
      res.redirect(`/urls`);
    }
  }
  res.status(401);
  res.redirect("/error");
});

// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

