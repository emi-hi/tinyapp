const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++){
    result += chars[(Math.floor(Math.random() * chars.length))];
    
  }
  return result
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  shortened = generateRandomString()
  long = req.body["longURL"]
  urlDatabase[shortened] = long
  // direction =  "/urls/:shortURL"
  // let templateVars = { shortURL: shortened, longURL: long }
  console.log(urlDatabase)
  res.redirect(`/urls/${shortened}`)
  // res.render("urls_show", templateVars); 

});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  console.log(longURL)
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

