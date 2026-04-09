const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities")
const accountModel = require("../models/account-model")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  if (account_password === accountData.account_password) {
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    return res.redirect("/account/")
  }

  req.flash("notice", "Please check your credentials and try again.")
  res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
  })
}

/* ****************************************
 *  Deliver account update view
 * ************************************ */
async function buildUpdateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id)

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccountInfo(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      req.flash("notice", "Account information updated successfully.")
      const accountData = await accountModel.getAccountById(account_id)
      return res.render("account/account", {
        title: "Account Management",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the update failed.")
      const accountData = await accountModel.getAccountById(account_id)
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        errors: null,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process password change
 * ************************************ */
async function updatePassword(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    const updateResult = await accountModel.updatePassword(account_id, account_password)

    if (updateResult) {
      req.flash("notice", "Password changed successfully.")
      const accountData = await accountModel.getAccountById(account_id)
      return res.render("account/account", {
        title: "Account Management",
        nav,
      })
    } else {
      const accountData = await accountModel.getAccountById(account_id)
      req.flash("notice", "Sorry, the password change failed.")
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        errors: null,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Logout
 * ************************************ */
function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have logged out.")
  res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,
  registerAccount,
  accountLogin,
  buildUpdateAccount,
  updateAccountInfo,
  updatePassword,
  logout,
}
