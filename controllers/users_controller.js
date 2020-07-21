const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("../config/nodemailer");
const bcrypt = require("bcrypt");

//render the sign up page
module.exports.signUp = function (req, res) {
  return res.render("user_sign_up", {
    recaptcha: res.recaptcha,
    title: "Sign Up Page",
  });
};

//render the sign in page
module.exports.signIn = function (req, res) {
  return res.render("user_sign_in", {
    recaptcha: res.recaptcha,
    title: "Sign In Page",
  });
};

//get the sign up data and send mail a mail to user confirmation and verification
module.exports.createUser = async function (req, res) {
  try {
    if (req.body.password != req.body.confirm_password) {
      req.flash("error", "Password and Confirm Password doesn't match");
      return res.redirect("back");
    }
    if (req.recaptcha.error) {
      req.flash("error", "Recaptcha Issue");
      return res.redirect("back");
    }
    let token = crypto.randomBytes(20).toString("hex");
    let person;

    await User.findOne(
      {
        email: req.body.email,
      },
      function (err, user) {
        if (err) {
          console.log("Error in finding user in signing up");
          return res.redirect("back");
        }
        if (user) {
          req.flash(
            "error",
            "username already exists try to login or reset your password"
          );
          return res.redirect("back");
        }
      }
    );

    const hashedPassword = await new Promise((res, rej) => {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          if (err) {
            req.flash("error", "hash geneartion error");
            rej(hash);
            return res.redirect("/sign-up");
          }
          res(hash);
        });
      });
    });

    await User.create(
      {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        isVerified: false,
        passwordToken: token,
        tokenExpiry: Date.now() + 1000000,
      },
      function (err, user) {
        if (err) {
          console.log("Error! Cannot create the user try again");
          return res.redirect("back");
        }
        person = user;
        nodemailer.sendMail(
          {
            to: person.email,
            subject: "Account Confirmation & Verfication",
            text:
              "Click on the link to verify your account \n\n" +
              "http://" +
              req.headers.host +
              "/users/verify-user/" +
              token +
              "\n\n",
          },
          function (err, info) {
            if (err) {
              req.flash("error", "Error! Cannot send mail");
              return;
            }
            req.flash("success", "Mail sent successfully");
            return res.redirect("back");
          }
        );
        req.flash(
          "success",
          "Your account has been created kindly check your mail and verify it"
        );
      }
    );
  } catch (err) {
    req.flash("error", `${err}`);
    return res.redirect("back");
  }
};

//to verify the user after signing-up and clicking on the email link
module.exports.verifyUser = async function (req, res) {
  try {
    await User.findOne(
      { passwordToken: req.params.token, tokenExpiry: { $gt: Date.now() } },
      function (err, user) {
        if (!user) {
          req.flash("error", "Token has been expired or isn't valid");
          return res.redirect("back");
        }
        user.isVerified = true;
        user.save();
        req.flash("success", "Hurray! Your account is verified successfully");
        return res.redirect("/users/sign-in");
      }
    );
  } catch (err) {
    req.flash("error", `Error caught ${err}`);
    res.redirect("back");
  }
};

//sign in and create session for user
module.exports.createSession = function (req, res) {
  req.flash("success", "LoggedIn Successfully");
  return res.redirect("/");
};

//sign out
module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have logged out!");
  return res.redirect("/");
};

//forgot password form views
module.exports.forgotPassword = function (req, res) {
  return res.render("forgot_password", {
    title: "Forgot Password Page",
  });
};

//forgot password
module.exports.forgotPasswordAction = async function (req, res) {
  try {
    const token = crypto.randomBytes(20).toString("hex");
    var person;
    await User.findOne({ email: req.body.email }, function (err, user) {
      if (!user) {
        req.flash(
          "error",
          "No such user exists, kindly check your username or sign up"
        );
        return res.redirect("/users/forgot-password");
      }
      user.passwordToken = token;
      user.tokenExpiry = Date.now() + 1000000;
      user.save();
      person = user;

      nodemailer.sendMail(
        {
          to: person.email,
          subject: "==>ForgotPassword: Reset Email",
          text:
            "Click on the link to reset your password :\n\n" +
            "http://" +
            req.headers.host +
            "/users/reset-password/" +
            token +
            "\n\n",
        },
        function (err, info) {
          if (err) {
            req.flash("error", "Cannot send mail");
            return;
          }
          req.flash("success", "Mail sent successfully");
          console.log("message sent -->", info);
          return res.redirect("back");
        }
      );
    });
  } catch (err) {
    req.flash("error", "error cought");
    return res.redirect("/users/forgot-password");
  }
};

//reset form view
module.exports.resetPasswordForm = function (req, res) {
  return res.render("password_reset", {
    title: "Reset Password",
    token: req.params.token,
  });
};

//reset password post action
module.exports.resetPasswordAction = async function (req, res) {
  try {
    await User.findOne(
      { passwordToken: req.params.token, tokenExpiry: { $gt: Date.now() } },
      function (err, user) {
        if (!user) {
          req.flash("error", "Token has benn expired or isn't valid");
          return res.redirect("back");
        }
        if (req.body.password === req.body.confirm_password) {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
              if (err) {
                req.flash("error", "hash generation error");
                return res.redirect("back");
              }
              user.password = hash;
              user.save();
            });
          });
          req.flash("success", "Password changed & Upated successfully");
          return res.redirect("/");
        } else {
          req.flash("error", "Passwords didn't match");
          return res.redirect("back");
        }
      }
    );
  } catch (err) {
    req.flash("error", "some error");
    return res.redirect("back");
  }
};

//reset password after signin in
module.exports.resetPasswordAfterSignIn = async function (req, res) {
  try {
    await User.findOne({ email: req.user.email }, function (err, user) {
      if (!user) {
        req.flash("error", "Please check your email");
        return res.redirect("back");
      }
      if (req.body.password === req.body.confirm_password) {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) {
              req.flash("error", "hash generation error");
              return res.redirect("back");
            }
            user.password = hash;
            user.save();
          });
        });
        req.flash("success", "Password updation successful");
        return res.redirect("/sign-in");
      } else {
        req.flash("error", "Passwords didn't match");
        return res.redirect("back");
      }
    });
  } catch (err) {
    req.flash("error", err);
    return res.redirect("back");
  }
};
