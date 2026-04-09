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

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Deliver account update view
router.get(
  "/update/:account_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// Process account information update
router.post(
  "/update-info",
  utilities.checkJWTToken,
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
)

// Process password change
router.post(
  "/change-password",
  utilities.checkJWTToken,
  utilities.checkLogin,
  regValidate.changePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
)

// Export the router
module.exports = router;