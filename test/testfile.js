
const getUserByEmail = function (email, database) {
  for (let id in database) {
    if(database[id]["email"] === email) {
      return database[id];
    }
  }
}



const testUsers = {
  "e4r5t6": {
    id: "e4r5t6", 
    email: "user1@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "p0o9i8": {
    id: "p0o9i8", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};



const user = getUserByEmail("user1@example.com", testUsers)


console.log(user)