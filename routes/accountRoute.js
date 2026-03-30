// Required resources
const express = require("express");
const router = new express.Router();
const regValidate = require('../utilities/account-validation')

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

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Export the router
module.exports = router;