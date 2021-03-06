const express = require("express");          //Requiring all depedencies and importing functions
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
  },
  Abcd34: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "u1aaBB"
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

app.get("/", (req, res) => {                //Home page
  if (!req.session.user_id) {                           //Checking presence of coookies
    res.redirect("/login");
  } else {
    res.redirect("urls");
  }
});

app.get("/urls", (req, res) => {            //Landing page after login / register

  if (!req.session.user_id) {
    res.redirect("/urls/error");
    return;
  }

  const templateVars = {
    email: req.session.user_id ? users[req.session.user_id]["email"] : "",   //email (if logged in) needs to be passed into header.ejs to show.
    urls: urlsForUser(req.session.user_id, urlDatabase)                      //getting user URLs
  };

  res.render("urls_index", templateVars);                                    //templateVars object is passed to ejs files for use of inside information.
});

app.get("/urls/error", (req, res) => {      //Page to show error messages to user
  const templateVars = {
    email: req.session.user_id ? users[req.session.user_id]["email"] : "",
    msg: "Please Login to see URL details"
  };
  res.render("urls_err", templateVars);
});


app.get("/urls/new", (req, res) => {        //Page showing new URL creation 
  const templateVars = {
    email: req.session.user_id ? users[req.session.user_id]["email"] : "",
  };
  if (templateVars.email) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const myLongUrl = req.body.longURL;
    const myShortURL = generateRandomString();
    urlDatabase[myShortURL] = {};
    urlDatabase[myShortURL]["longURL"] = myLongUrl;                 //New URL entry being created
    urlDatabase[myShortURL]["userID"] = req.session.user_id;

    res.redirect(`/urls/${myShortURL}`);
  } else {
    const templateVars = {
      email: "",
      msg: "Please Login to proceed."
    };
    res.render("urls_err", templateVars);

  }
});

app.get("/u/:shortURL", (req, res) => {             //Page to process shortened URLs
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    const templateVars = {
      email: req.session.user_id ? users[req.session.user_id]["email"] : "",
      msg: "Invalid shortURL entered. Please try again"
    };
    res.render("urls_err", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {        //Page to show shortened URLs inforamtion

  if (!req.session.user_id) {
    res.redirect("/urls/error");
    return;
  }
  if (!urlDatabase[req.params.shortURL]) {
    const templateVars = {
      email: users[req.session.user_id]["email"],
      msg: "Invalid shortURL entered. Please try again"
    };
    res.render("urls_err", templateVars);
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

app.post("/urls/:shortURL/delete", (req, res) => {          //Handling deletion of an entry
  if (req.session.user_id) {
    if (urlDatabase[req.params.shortURL]["userID"] === req.session.user_id) {
      const deleteIt = req.params.shortURL;
      delete urlDatabase[deleteIt];
      res.redirect('/urls');
    } else {
      const templateVars = {
        email: users[req.session.user_id]["email"],
        msg: "This URL does not belong to you. Please try again"
      };
      res.render("urls_err", templateVars);
    }
  } else {
    const templateVars = {
      email: "",
      msg: "Please login to proceed"
    };
    res.render("urls_err", templateVars);

  }
});

app.post("/urls/:id", (req, res) => {           //Handling updation of URL

  if (req.session.user_id) {
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
  } else {
    const templateVars = {
      email: "",
      msg: "Please Login to proceed"
    };
    res.render("urls_err", templateVars);
  }
});

app.get("/login", (req, res) => {               //The Login page
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      email:""
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/login", (req, res) => {            //Checking user information post login
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const templateVars = {
    email: "",
    msg: ""
  };
  
  if (!inputEmail || !inputPassword) {
    templateVars.msg = "Empty Input. Please fill both fields.";
    res.render("urls_err", templateVars);
    return;
  }
  
  if (emailFind(inputEmail, users)) {
    const ourUser = getUserByEmail(inputEmail, users);
    if (bcrypt.compareSync(inputPassword, ourUser.password)) {          //use of bcrypt to access hashed password
      req.session.user_id = ourUser.id;
      res.redirect('urls');
    } else {
      templateVars.msg = "Wrong Password Entered";
      res.render("urls_err", templateVars);
    }
  } else {
    templateVars.msg = "Cannot find user";
    res.render("urls_err", templateVars);
  }
});

app.post("/logout", (req, res) => {             //Handling logout process
  req.session = null;
  res.redirect('/urls');

});

app.get("/register", (req, res) => {            //User registration page
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      email : ""
    };
    res.render('urls_register', templateVars);
  }
});

app.post("/register", (req, res) => {           //Checking user information post registering
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const templateVars = {
    email: "",
    msg: ""
  };
  if (!inputEmail || !inputPassword) {
    templateVars.msg = "Empty Input. Please fill both fields.";
    res.render("urls_err", templateVars);
    return;
  }

  if (!emailFind(inputEmail, users)) {
    const userId = generateRandomString();
    const salt = bcrypt.genSaltSync(10);                  
    users[userId] = {
      id: userId,
      email: inputEmail,
      password: bcrypt.hashSync(inputPassword,salt)           //use of brcypt to store password after hashing it.
    };
    req.session.user_id = userId;
    res.redirect('urls');
  } else {
    templateVars.msg = "Email already registered. Please try again";
    res.render("urls_err", templateVars);
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});