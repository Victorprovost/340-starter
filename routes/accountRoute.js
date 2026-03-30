// Required resources
const express = require("express");
const router = new express.Router();

// Utilities (error handler, etc.)
const utilities = require("../utilities/");

// Account controller (you will create this)
const accountController = require("../controllers/accountController");

// Route for "My Account"
// NOTE: This is AFTER "/account" (set in server.js)
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Export the router
module.exports = router;