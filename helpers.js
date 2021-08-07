const getUserByEmail = function (email, database) {
  for (let id in database) {
    if(database[id]["email"] === email) {
      return database[id];
    }
  }
}

const emailFind = function (email, db) {
  for( let id in db) {
    if(db[id]["email"] === email) {
      return true;
    }
  }
  return false;
}




const urlsForUser = function(user, urlDatabase) {
  let selectedURL = {};
  for ( let entry in urlDatabase) {
    if(urlDatabase[entry]["userID"] === user) {
      selectedURL[entry] = urlDatabase[entry]["longURL"];
    }
  }
  return selectedURL;
}

const generateRandomString = function() {

  const randomString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678912";
  let myString = "";
  for (let i = 0; i < 6; i++) {
    myString = myString + randomString[Math.floor(Math.random() * 62)];
  }
  return myString;
};

module.exports = {getUserByEmail, emailFind, urlsForUser, generateRandomString};