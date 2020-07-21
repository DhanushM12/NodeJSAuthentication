const express = require("express");
const router = express.Router();
const passport = require("passport");

const homeController = require("../controllers/home_controller");
const usersController = require("../controllers/users_controller");
const Recaptcha = require("express-recaptcha").RecaptchaV2;

const SITE_KEY = "####";
const SECRET_KEY = "####";

const recaptcha = new Recaptcha(SITE_KEY, SECRET_KEY, { callback: "cb" });

//signup a user
router.get("/sign-up", recaptcha.middleware.render, usersController.signUp);

//create a user
router.post("/create", recaptcha.middleware.verify, usersController.createUser);

//to verify user
router.get("/verify-user/:token", usersController.verifyUser);

//signin a user
router.get("/sign-in", recaptcha.middleware.render, usersController.signIn);

//create session
router.post(
  "/create-session",
  recaptcha.middleware.verify,
  passport.authenticate("local", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);

//logout a user
router.get("/sign-out", usersController.destroySession);

//sign in user reset password
router.get("/reset-password/:token", usersController.resetPasswordForm);

//password reset Form and send email
router.post(
  "/reset-password-action/:token",
  usersController.resetPasswordAction
);

//forgot password
router.get("/forgot-password", usersController.forgotPassword);

//forgot password and send email
router.post("/forgot-password-action", usersController.forgotPasswordAction);

//reset password
router.get("/reset-password-signed-in", usersController.resetPasswordForm);

//reset after sign in
router.post(
  "/reset-password-signed-in",
  usersController.resetPasswordAfterSignIn
);
//google Oauth sign in/up
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//google callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);

module.exports = router;
