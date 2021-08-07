const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const {getUserByEmail, emailFind, urlsForUser, generateRandomString} = require('./helpers');  //Importing helper functions
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const PORT = 8080;

const urlDatabase = {                             // Database containing URL with userID
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "u1aaBB"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "u2ggRR"
  }
};

const users = {                                   //User Database
  "u1aaBB": {
    id: "u1aaBB",
    email: "user1@gmail.com",
    password: '$2b$10$65bu/NREtNTV9ztewHmgRuXB1yVSM.9PdsvBIvy5Ql0RGHFSDmtIm'
  },
  "u2ggRR": {
    id: "u2ggRR",
    email: "user2@gmail.com",
    password: '$2b$10$36g8lRU8D0gTTAZ9QcCqM.lJ8E6X1dAJbuJ2t9mXLkzRrgPpzjOIy'
  }
};

app.get("/urls", (req, res) => {

  if (!req.session.user_id) {
    res.redirect("/urls/error");
    return;
  }

  const templateVars = {
    email: req.session.user_id ? users[req.session.user_id]["email"] : "",
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/error", (req, res) => {
  const templateVars = {
    email: req.session.user_id ? users[req.session.user_id]["email"] : "",
    msg: "Please Login to see URL details"
  };
  res.render("urls_err", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    email: req.session.user_id ? users[req.session.user_id]["email"] : "",
  };
  res.render("urls_new", templateVars);

});

app.post("/urls", (req, res) => {

  if (req.session.user_id) {

    const myLongUrl = req.body.longURL;
    const myShortURL = generateRandomString();
    urlDatabase[myShortURL] = {};
    urlDatabase[myShortURL]["longURL"] = myLongUrl;
    urlDatabase[myShortURL]["userID"] = req.session.user_id;

    res.redirect(`/urls/${myShortURL}`);
  } else {

    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.status(400).send("Invalid shortened URL entered");
  }
});

app.get("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
    res.redirect("/urls/error");
    return;
  }
  if (urlDatabase[req.params.shortURL]["userID"] === req.session.user_id) {
    const templateVars = {
      email: req.session.user_id ? users[req.session.user_id]["email"] : "",
      shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"]
    };

    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      email: req.session.user_id ? users[req.session.user_id]["email"] : "",
      msg: "This URL does not belong to you. Please try again"
    };
    res.render("urls_err", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userid1 = req.session && req.session.user_id;
  if (urlDatabase[req.params.shortURL]["userID"] === userid1) {
    const deleteIt = req.params.shortURL;

    delete urlDatabase[deleteIt];
    res.redirect('/urls');
  } else {
    const templateVars = {
      email: req.session.user_id ? users[req.session.user_id]["email"] : "",
      msg: "This URL does not belong to you. Please try again"
    };
    res.render("urls_err", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {

  if (urlDatabase[req.params.id]["userID"] === req.session.user_id) {
    urlDatabase[req.params.id]["longURL"] = req.body.newLongUrl;
    res.redirect('/urls');
  } else {
    const templateVars = {
      email: req.session.user_id ? users[req.session.user_id]["email"] : "",
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
  if (!inputEmail || !inputPassword) {
    res.status(400).send("Empty Input. Please fill both fields.");
    return;
  }
  
  if (emailFind(inputEmail, users)) {
    const ourUser = getUserByEmail(inputEmail, users);
    // if(inputPassword === ourUser.password) {
    if (bcrypt.compareSync(inputPassword, ourUser.password)) {
      req.session.user_id = ourUser.id;
      //  res.cookie('user_id', ourUser.id);
      res.redirect('urls');
    } else {
      res.status(403).send("Wrong password");
    }
  } else {
    res.status(403).send("Cannot find user.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');

});

app.get("/register", (req, res) => {
  const templateVars = {
    email : ""
  };
  req.session = null;
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  if (!inputEmail || !inputPassword) {
    res.status(400).send("Empty Input. Please fill both fields.");
    return;
  }

  if (!emailFind(inputEmail, users)) {
    const userId = generateRandomString();
    const salt = bcrypt.genSaltSync(10);
    users[userId] = {
      id: userId,
      email: inputEmail,
      // password: inputPassword
      password: bcrypt.hashSync(inputPassword,salt)
    };
    console.log(users);
    req.session.user_id = userId;
    res.redirect('urls');
  } else {
    res.status(400).send("Email already in use");
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});