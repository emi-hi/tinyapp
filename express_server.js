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
const { getUserByEmail, urlsForUser, generateRandomString, createDate } = require("./helpers");
      
// USER DATABASE
let users = {
  "Emily": {
    id: "123",
    email: "1@1.com",
    password: "$2b$10$TX24JwNR83Jb35l9wX9EwepkmuHaxaqUFGDFE8V0DBrTPHjKqy72O"
  }
};

//URL DATABASE
let urlDatabase = {
  "b2xVn2": { longUrl: "http://www.lighthouselabs.ca", userId: "123", visits: 0, dateCreated: "2019-10-2", uniqueVisits: 0 },
  "b2xVn3": { longUrl: "http://www.cbc.ca", userId: "123", visits: 0, dateCreated: "2019-10-2", uniqueVisits: 0 },
  "9sm5xK": { longUrl: "http://www.google.com", userId: "123", visits: 0, dateCreated: "2019-10-2", uniqueVisits: 0},
  "xxxxxx": { longUrl: "http://www.example.com", userId: "123", visits: 0, dateCreated: "2019-10-2", uniqueVisits: 0 },
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

//register username page
app.get("/urls/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("register", templateVars);
});

//login page
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
  urlDatabase[req.params.shortURL]["visits"] += 1
  res.redirect(urlDatabase[req.params.shortURL]["longUrl"]);
});

// page with info on specific URL! Short and long
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id !== undefined) {
    const urlsToDisplay = urlsForUser(req.session.user_id["id"], urlDatabase);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      const templateVars = { shortURL: req.params.shortURL, longURL: urlsToDisplay[req.params.shortURL], user_id: req.session.user_id, visits: urlDatabase[req.params.shortURL]["visits"], dateCreated: urlDatabase[req.params.shortURL]["dateCreated"] };
      res.render("urls_show", templateVars);
    }
  } else {
  // res.status(401);
  res.redirect("/error");
  }
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
  } else {
    const id = generateRandomString(10);
    const hashedPass = bcrypt.hashSync(userPass, 10);
    users[id] = {
      id: id,
      email: newEmail,
      password: hashedPass
    };
    req.session.user_id = users[id];
    res.redirect(`/urls/`);
  }
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
  } else {
    res.redirect("/loginError");
  }
});

//create shortened string and redirect!
app.post("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const shortened = generateRandomString(6);
    fullDate = createDate();
    urlDatabase[shortened] = {
      longUrl: req.body["longURL"],
      userId: req.session.user_id["id"],
      visits: 0,
      dateCreated: fullDate
    };
    res.redirect(`/urls/${shortened}`);
  } else {
    res.status(401);
    res.redirect("/error");
  }
});

// EDIT THE LONG VERSION OF URL
app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id !== undefined) {
    const urlsToDisplay = urlsForUser(req.session.user_id["id"], urlDatabase);
    if (urlsToDisplay[req.params.shortURL] !== undefined) {
      fullDate = createDate();
      const shortURL = req.params.shortURL;
      const longURL = req.body["longURL"];
      urlDatabase[shortURL] = {
        longUrl: longURL,
        userId: req.session.user_id["id"],        
        visits: 0,
        dateCreated: fullDate
      };
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.status(401);
      res.redirect("/error");
    }
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
  } else {  
    res.status(401);
    res.redirect("/error");
  }
});

// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

