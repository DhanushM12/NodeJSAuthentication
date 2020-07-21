const User = require("../models/user");

//exporting the home controller
module.exports.home = async function (req, res) {
  try {
    return res.render("home", {
      title: "title",
    });
  } catch (error) {
    console.log("Error", error);
    return;
  }
};
