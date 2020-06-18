const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');

const router = require("express").Router();

const Users = require("../users/users-model.js");
const { isValid } = require("../users/users-service.js");
const constants = require("../config/constants.js"); 

router.post("/register", (req, res) => {
  const credentials = req.body;

  if (isValid(credentials)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;

    // hash the password
    const hash = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = hash;

    // save the user to the database
    Users.add(credentials)
      .then(user => {
        res.status(201).json({ data: user });
      })
      .catch(error => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({
      message: "please provide username and password",
    });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (isValid(req.body)) {
    Users.findBy({ username: username })
      .then(([user]) => {
        console.log("user:", user);
        
        // compare the password the hash stored in the database
        if (user && bcryptjs.compareSync(password, user.password)) {
          const token = createToken(user);

          res.status(200).json({ token, message: "Welcome to our API" }); //send the token and the message
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({
      message: "please provide username and password",
    });
  }
});

//create a token function

function createToken(user){
  const payload = { //payload is the data we want to store inside the token
    subject: user.id,
    username: user.username,
    role: user.role,
  };
  
  //the secret is being imported from ../config/constants
  const secret = constants.jwtSecret; //the secret is to sign the token to make sure we can verify the token when it cmes back
  
  const options = {
    expiresIn: '1d', //this means 1 day // this is the expiration timeframe for the token
  };

  return jwt.sign(payload, secret, options); //the sign method will return a new token that we will have access to
}

module.exports = router;
