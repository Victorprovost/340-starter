/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const cookieparser = require("cookie-parser")
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const invModel = require("./models/inventory-model")
const utilities = require("./utilities")
const bodyParser = require("body-parser")


/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieparser())
app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// Classification route aliases (friendly URLs from nav)
app.get(["/custom", "/sedan", "/suv", "/truck"], async function (req, res, next) {
  const classificationName = req.path.substring(1).toLowerCase()

  try {
    const data = await invModel.getClassifications()
    const match = data.rows.find((row) => row.classification_name.toLowerCase() === classificationName)

    if (match) {
      return res.redirect(`/inv/type/${match.classification_id}`)
    }

    return next()
  } catch (error) {
    return next(error)
  }
})

// Index Route
app.get("/", async function(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("index", { title: "Home", nav })
  } catch (error) {
    next(error)
  }
})

// 404 Handler: no route matched
app.use((req, res, next) => {
  const err = new Error(`Page not found: ${req.originalUrl}`)
  err.status = 404
  next(err)
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || "An unexpected error occurred."
  console.error(`Error at: "${req.originalUrl}" - ${status} - ${message}`)
  let nav = ""
  utilities.getNav()
    .then((navHtml) => {
      nav = navHtml
      res.status(status).render("errors/error", {
        title: status,
        message,
        nav,
      })
    })
    .catch((utilError) => {
      console.error("Error generating nav in error handler:", utilError)
      res.status(status).render("errors/error", {
        title: status,
        message,
        nav: "<ul><li><a href='/'>Home</a></li></ul>",
      })
    })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
