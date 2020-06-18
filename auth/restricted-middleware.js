const jwt = require('jsonwebtoken'); //needs the library to access the "verify" method

const constants = require("../config/constants.js");


module.exports = (req, res, next) => {
  // add code here to verify users are logged in

  const token = req.headers.authorization; //read the authorization header
  const secret = constants.jwtSecret; //the secret is imported from ../config/constants.js

    if(token){
      jwt.verify(token, secret, (error, decodedToken) =>{ //callback function must be an arrow function
        if(error){
          //the token is invalid
          res.status(401).json({message: "you cannot pass"});
        }else{
          req.decodedToken = decodedToken;

          next();
        }
      });
      
    }else{
      res.status(401).json({message: "please provide credentials to access this resource"})
    }


  
};
