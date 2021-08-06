const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "u1aaBB"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "u2ggRR"
  }
};

const users = { 
  "u1aaBB": {
    id: "u1aaBB", 
    email: "user1@gmail.com", 
    password: "p12345"
  },
 "u2ggRR": {
    id: "u2ggRR", 
    email: "user2@gmail.com", 
    password: "p67890"
  }
}

const generateRandomString = function() {

  const randomString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678912";
  let myString="";
    for (let i = 0; i <6 ; i++) {
      myString = myString + randomString[Math.floor(Math.random()*62)];
    }
    return myString;
};

const emailFind = function (email) {
  for( let id in users) {
    if(users[id]["email"] === email) {
      return true;
    }
  }
  return false;
}

const idfinder = function (email) {
  for (let id in users) {
    if(users[id]["email"] === email) {
      return users[id];
    }
  }
}


const urlsForUser = function(user) {
  let selectedURL = {};
  for ( let entry in urlDatabase) {
    if(urlDatabase[entry]["userID"] === user) {
      selectedURL[entry] = urlDatabase[entry]["longURL"];
    }
  }
  console.log(selectedURL);
  return selectedURL;
}

app.get("/urls", (req, res) => {

if(!req.cookies["user_id"]) {
  res.redirect("/urls/error");
  return;
}

  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    urls: urlsForUser(req.cookies["user_id"])
  };

    res.render("urls_index", templateVars);
});

app.get("/urls/error", (req, res) => {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    msg: "Please Login to see URL details"
  };
  res.render("urls_err", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
  };
    res.render("urls_new", templateVars);

});

app.post("/urls", (req, res) => {

  if(req.cookies["user_id"]) {

  const myLongUrl = req.body.longURL;
  const myShortURL = generateRandomString();
  urlDatabase[myShortURL] = {};
  urlDatabase[myShortURL]["longURL"] = myLongUrl;
  urlDatabase[myShortURL]["userID"] = req.cookies["user_id"];

  res.redirect(`/urls/${myShortURL}`);          
  } else {

  res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
   const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
  } else {
  res.status(400).send("Invalid shortened URL entered");
  }
});

app.get("/urls/:shortURL", (req, res) => {

  if(!req.cookies["user_id"]) {
    res.redirect("/urls/error");
    return;
  }
  if(urlDatabase[req.params.shortURL]["userID"] === req.cookies["user_id"] ) {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] 
  };

  res.render("urls_show", templateVars);
} else {
  const templateVars = { 
  email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
  msg: "This URL does not belong to you. Please try again"
  };
  res.render("urls_err", templateVars);
}
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlDatabase[req.params.shortURL]["userID"] === req.cookies["user_id"] ) {
  const deleteIt = req.params.shortURL;
  delete urlDatabase[deleteIt];
  res.redirect('/urls');
  } else {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    msg: "This URL does not belong to you. Please try again"
    };
    res.render("urls_err", templateVars);
  }
})

app.post("/urls/:id", (req, res) => {

  if(urlDatabase[req.params.id]["userID"] === req.cookies["user_id"] ) {
    urlDatabase[req.params.id]["longURL"] = req.body.newLongUrl;
    res.redirect('/urls');
  } else {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    msg: "This URL does not belong to you. Please try again"
    };
    res.render("urls_err", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { 
    email:""
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  if(!inputEmail || !inputPassword) {
    res.status(400).send("Empty Input. Please fill both fields.");
    return;
  }
  
  if(emailFind(inputEmail)) {
    const ourUser = idfinder(inputEmail);
    // if(inputPassword === ourUser.password) {
      if(bcrypt.compareSync(inputPassword, ourUser.password)) {
     res.cookie('user_id', ourUser.id);
     res.redirect('urls');
  } else {
      res.status(403).send("Wrong password");
  }
  } else {
    res.status(403).send("Cannot find user.");
  }
});

app.post("/logout", (req, res) => {
  res.cookie('user_id', "");
  res.redirect('/urls');

});

app.get("/register", (req, res) => {
  const templateVars = { 
    email : ""
  };
  res.cookie('user_id', "");
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  if(!inputEmail || !inputPassword) {
    res.status(400).send("Empty Input. Please fill both fields.");
    return;
  }

  if(!emailFind(inputEmail)) {
    const userId = generateRandomString();
    const salt = bcrypt.genSaltSync(10);
    users[userId] = {
    id: userId,
    email: inputEmail,
    // password: inputPassword
    password: bcrypt.hashSync(inputPassword,salt)
    }
    res.cookie('user_id', userId);
    res.redirect('urls');
  } else {
    res.status(400).send("Email already in use");
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});