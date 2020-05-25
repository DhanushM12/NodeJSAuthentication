const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
//required user schema
const User = require("../models/user");
//library which help to hash passwords
const bcrypt = require("bcrypt");

//authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      //checking if there is error in recaptcha
      if (req.recaptcha.error) {
        req.flash("error", "Captcha Error");
        return res.redirect("back");
      }
      //find a user and establish identity
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          req.flash("error", err);
          return done(err);
        }
        //to check password using bycrypt compare method
        bcrypt.compare(password, user.password, function (err, isMatch) {
          if (err) {
            req.flash("error", "Invalid Username/Password, please try again");
            return done(err);
          }
          if (isMatch) {
            if (user.isVerified) {
              return done(null, user);
            } else {
              req.flash(
                "error",
                "User isn't verified yet, Please check your mail, verify it and then try to sign in"
              );
              return done(null, false);
            }
          }

          req.flash("error", "Invalid Username/Password, please try again");
        });
      });
    }
  )
);

//serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//deserializing the user from the key in the cookies
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
      console.log("Error in finding user --> Passport");
      return done(err);
    }
    return done(null, user);
  });
});

//check if user is authenticated
passport.checkAuthentication = function (req, res, next) {
  //if user is signed in then pass on the req to next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }

  //if the user is not sign -in
  return res.redirect("/users/sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    //req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
