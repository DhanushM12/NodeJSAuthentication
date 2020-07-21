const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home_controller");

//entry point for every route
router.get("/", homeController.home);

//user related routes
router.use("/users", require("./users"));

module.exports = router;
