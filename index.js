const express = require("express");
const app = express();
const port = 8000;
const expressLayout = require("express-ejs-layouts");
const db = require("./config/mongoose");
const cookieParser = require("cookie-parser");
//used for session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");

const passportGoogle = require("./config/passport-google-oauth2-strategy");

const MongoStore = require("connect-mongo")(session);

const flash = require("connect-flash");
const customMware = require("./config/middleware");

app.use(express.urlencoded());
app.use(cookieParser());
app.use(expressLayouts);

app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

//set the view engine as EJS
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"));
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    name: "authsystem",
    secret: "mykey",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 10000 * 60 * 60,
    },
    store: new MongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect-mongo working fine");
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());

app.use(customMware.setFlash);

app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`Error in connecting to port ${port}`);
  }
  console.log(`MongoDB Connected! Successfully running on ${port}`);
});
