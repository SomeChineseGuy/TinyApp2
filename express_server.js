const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
// const cookieSession = require('cookie-session');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userURL: "user2RandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userURL: "userRandomID"
  }
};

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
  }
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// app.use(cookieSession({
//   name: 'session',
//   keys: ['SomeRandomKey'],
 
//   maxAge: 24 * 60 * 60 * 1000
// }));

app.use(function (req, res, next) {
  res.locals.user = users[req.cookies['userId']];
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
  if (!url.includes(string)) {
    return `http://${url}`;
  }
  return url;
}

function credentialsCheck(email, password) {
  if (!email || !password) {
    return true;
  }
}

function exsistingEmailCheck(email) {
  for (var id in users) {
    if (users[id].email === email)  { return true; }
  }
}

function checkExsistingUser (email, password){
  for (id in users) {
    if (users[id].email === email && users[id].password === password) {
      return id;
    }
  }
}


//-------------------------------- Creating new urls
app.get("/urls/new", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  let newLong = generateRandomString();
  let fullURL = addHttp(req.body.longURL);
  urlDatabase[newLong] = {
    longURL: fullURL
  };
  res.redirect("/urls");
});

//-------------------------------- Deleting urls

app.post("/urls/:shortURL/delete", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  delete urlDatabase[req.params.shortURL];
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  res.render("_login");
});

app.post("/login", (req, res) => {
  let lEmail = req.body.email;
  let lPassword = req.body.password;
  let currentUser = checkExsistingUser(lEmail, lPassword);
  if (!currentUser)  {
    return res.status(403).send("LIES!!!!");
  }
  res.cookie("userId", currentUser);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/");
});
//------------------------------------ Home

app.get("/", (req, res) => {
  res.render("_login");
});

//------------------------------------ /URLS

app.get("/urls", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  urlDatabase[req.params.shortURL].longURL = addHttp(req.body.longURL);
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if(!res.locals.user) {
    return res.status(401).render("_401");
  }
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].url;
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("_register");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const uEmail = req.body.email;
  const uPassword = req.body.password;
  if (credentialsCheck(uEmail, uPassword)) {
    return res.status(400).send("No username or password");
  } else {
    if(exsistingEmailCheck(uEmail)) {
      return res.status(400).send("Email already in uses!");
    }
  }
  users[userId] = {
    id: userId,
    email: uEmail,
    password: uPassword
  };
  res.cookie("userId", userId);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});