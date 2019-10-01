const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars[(Math.floor(Math.random() * chars.length))];
    
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.set("view engine", "ejs");

//main page / index
app.get("/", (req, res) => {
  res.send("Hello!");
});

// URLS index
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// add a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//EDIT THE LONG VERSION
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"]
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`)
});

// page with info on specific URL! Short and long
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//create shortened string and redirect!
app.post("/urls", (req, res) => {
  shortened = generateRandomString()
  urlDatabase[shortened] = req.body["longURL"];;
  res.redirect(`/urls/${shortened}`)

});

//if user goes to the shortened URL, redirect to the long version! 
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  // delete urlDatabase[]
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

