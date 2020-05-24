//require the same instance of mongoose library
const mongoose = require("mongoose");

//designing the user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    passwordToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

//passing the userSchema instance to mongoose.model
const User = mongoose.model("User", userSchema);

//exporting the schema to be used
module.exports = User;
