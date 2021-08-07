const getUserByEmail = function(email, database) {        //Returns user information relating to provided email.
  for (let id in database) {
    if (database[id]["email"] === email) {
      return database[id];
    }
  }
};

const emailFind = function(email, database) {             //Returns true if an email is found in provided database.
  for (let id in database) {
    if (database[id]["email"] === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function(user, urlDatabase) {         //Returns list of all URLS belonging to an user.
  let selectedURL = {};
  for (let entry in urlDatabase) {
    if (urlDatabase[entry]["userID"] === user) {
      selectedURL[entry] = urlDatabase[entry]["longURL"];
    }
  }
  return selectedURL;
};

const generateRandomString = function() {               //Generates and returns random strings for ID and record creation purpose.

  const randomString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678912";
  let myString = "";
  for (let i = 0; i < 6; i++) {
    myString = myString + randomString[Math.floor(Math.random() * 62)];
  }
  return myString;
};

module.exports = {getUserByEmail, emailFind, urlsForUser, generateRandomString};