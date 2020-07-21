const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const env = require("./environment");

//defining transporter
// create reusable transporter object using the default SMTP transport
//this is the part which sends email and how communication takes place
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  post: 587,
  source: false,
  auth: {
    user: "dhanushmukhi",
    pass: "",
  },
});
