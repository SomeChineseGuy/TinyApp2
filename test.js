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

function matchingCurrrentUser (dataId, usersID) {
  for(i in dataId) {
    if (dataId[i].userURL === usersID) {
      return true;
    }
  }
}

// function loopDataBase(currentUser) {
//   for (keyDataBase in urlDatabase) {
//     if(matchingCurrrentUser(urlDatabase[keyDataBase].userURL, currentUser.id)) {

//     }
//   }
// }
 for (keyDataBase in urlDatabase) {
   console.log(urlDatabase[keyDataBase].userURL);
 }

  for (keyDataBase in users) {
   console.log(users[keyDataBase].id);
 }