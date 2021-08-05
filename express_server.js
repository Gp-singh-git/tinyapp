const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");


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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "a5b3c2": "http://www.example.com"
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


app.get("/urls", (req, res) => {

  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    urls: urlDatabase
  };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  
  const myLongUrl = req.body.longURL;
  const myShortURL = generateRandomString();
  urlDatabase[myShortURL] = myLongUrl;
  res.redirect(`/urls/${myShortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    email: req.cookies["user_id"] ? users[req.cookies["user_id"]]["email"] : "",
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteIt = req.params.shortURL;
  delete urlDatabase[deleteIt];
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongUrl;
  res.redirect('/urls');

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
  }
  
  if(emailFind(inputEmail)) {
    const ourUser = idfinder(inputEmail);
    console.log(ourUser);
    if(inputPassword === ourUser.password) {
     res.cookie('user_id', ourUser.id);
     res.redirect('urls');
  } else {
      res.status(403).send("Wrong password");
  }
  }
    res.status(403).send("Cannot find user.");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');

});

app.get("/register", (req, res) => {
  const templateVars = { 
    email : ""
  };
  res.clearCookie('user_id');
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  if(!inputEmail || !inputPassword) {
    res.status(400).send("Empty Input. Please fill both fields.");
  }

  if(!emailFind(inputEmail)) {
    const userId = generateRandomString();
    users[userId] = {
    id: userId,
    email: inputEmail,
    password: inputPassword
    }
    res.cookie('user_id', userId);
    res.redirect('urls');
  }
    res.status(400).send("Email already in use");
  
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});