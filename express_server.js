const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


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

const getIDfromEmail = (obj,val) => Object.keys(obj).find(key => obj[key]["email"] === val);

const validateEmail = function(email, password) {
  if (email === '' | password === '') {
    return false;
  } else {
    const theEmail = getIDfromEmail(users, email);
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
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
  res.render("urls_new", templateVars);
});

//if user goes to the shortened URL, redirect to the long version!
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// page with info on specific URL! Short and long
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"] };
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
    users[id] = {
      id: id,
      email: newEmail,
      password: req.body["password"]
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
  res.redirect("/urls");
});
//when a user logs in, redirect to the homepage!
app.post("/login", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"];
  if (validateEmail(email)) {
    let id = getIDfromEmail(users, email);
    if (password === (users[id]["password"])) {
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
  urlDatabase[shortened] = req.body["longURL"];
  res.redirect(`/urls/${shortened}`);

});

// EDIT THE LONG VERSION OF URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});
// DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  // delete urlDatabase[]
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

