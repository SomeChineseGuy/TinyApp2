const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

const bcrypt = require('bcrypt');

const urlDatabase = {
};

const users = {
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['SomeRandomKey']
}));

app.use(function (req, res, next) {
  res.locals.user = users[req.session.user_id];
  next();
});

app.set("view engine", "ejs");

//----------------------------- Functions

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function addHttp(url) {
  let string = "http://";
  if (!url.startsWith(string)) {
    return `http://${url}`;
  }
  return url;
}

function credentialsCheck(email, password) {
  return (!email || !password);
}

function existingEmailCheck(email) {
  for (id in users) {
    if (users[id].email === email)  { return true; }
  }
  return false;
}

function checkExistingUser (email, password){
  for (id in users) {
    if (users[id].email === email && bcrypt.compareSync(password, users[id].password)) {
      return id;
    }
  }
}

function matchingShort (shortUrl, userId) {
  return (urlDatabase[shortUrl].userID === userId);
}

function matchingCurrrentUser (database, userID) {
  let currentUserDB = {};
  for(let i in database) {
    if (database[i].userID === userID) {
      currentUserDB[i] = database[i];
    }
  }
  return currentUserDB;
}

//------------------------------------ Gets for home, urls n new

app.get("/", (req, res) => {
  if(res.locals.user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  let templateVars = { urls: matchingCurrrentUser(urlDatabase, res.locals.user.id)};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  res.render("urls_new");
});
//---------------------------------- Short URLS

app.get("/urls/:shortURL", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  if (!urlDatabase) {
    res.status(404).render("_404");
  }
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if(!matchingShort(shortURL, res.locals.user.id)) {
    return res.status(403).render("_403");
  }
  let templateVars = { longURL: longURL, shortURL: shortURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    res.status(404).render('_404');
  }
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//--------------------------------- Register

app.get("/register", (req, res) => {
  if(res.locals.user) {
    res.redirect("/");
  }
  res.render("_register");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const uEmail = req.body.email;
  const uPassword = req.body.password;
  if (credentialsCheck(uEmail, uPassword)) {
    return res.status(400).send("No username or password");
  } else {
    if(existingEmailCheck(uEmail)) {
      return res.status(400).send("Email already in uses!");
    }
  }
  users[userId] = {
    id: userId,
    email: uEmail,
    password: bcrypt.hashSync(uPassword, 10)
  };
  req.session.user_id = userId;
  res.redirect('/urls');
});

//------------------------------- Logins

app.get("/login", (req, res) => {
  if(res.locals.user) {
    res.redirect("/");
  }
  res.render("_login");
});

app.post("/login", (req, res) => {
  let lEmail = req.body.email;
  let lPassword = req.body.password;
  let currentUser = checkExistingUser(lEmail, lPassword);
  if (!currentUser)  {
    return res.status(403).render("_403");
  }
  req.session.user_id = currentUser;
  res.redirect("/");
});

app.post("/urls", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  let newLong = generateRandomString();
  let fullURL = addHttp(req.body.longURL);
  let userId = res.locals.user.id;
  let urlDetails = {};
  urlDetails['longURL'] = fullURL;
  urlDetails['userID'] = userId;
  urlDatabase[newLong] = urlDetails;
  res.redirect("/urls");
});

//-------------------------------- Logout

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

//-------------------------------- Deleting urls

app.post("/urls/:shortURL/delete", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  delete urlDatabase[req.params.shortURL];
  let templateVars = { urls: matchingCurrrentUser(urlDatabase, res.locals.user.id)};
  res.render("urls_index", templateVars);
});

//------------------------------------ /URLS

app.post("/urls/:shortURL", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).render("_404");
  }
  if (res.locals.user.id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).render("_403");
  }
  let templateVars = { urls: matchingCurrrentUser(urlDatabase, res.locals.user.id)};
  urlDatabase[req.params.shortURL].longURL = addHttp(req.body.longURL);
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});