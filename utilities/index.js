const jwt = require("jsonwebtoken")
require("dotenv").config()
const path = require("path")

function loadInventoryModel() {
  const candidates = [
    path.join(__dirname, "..", "340-starter", "models", "inventory-model"),
    path.join(__dirname, "..", "models", "inventory-model"),
    path.join(__dirname, "models", "inventory-model"),
    path.join(__dirname, "..", "..", "models", "inventory-model"),
    path.join(process.cwd(), "340-starter", "models", "inventory-model"),
    path.join(process.cwd(), "models", "inventory-model"),
  ]

  for (const candidate of candidates) {
    try {
      return require(candidate)
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") {
        throw err
      }
    }
  }

  throw new Error("Unable to locate inventory-model module in known paths.")
}

const invModel = loadInventoryModel()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    const classification = row.classification_name.toLowerCase()
    let href = "/inv/type/" + row.classification_id

    // Use friendly routes if they are configured
    if (["custom", "sedan", "suv", "truck"].includes(classification)) {
      href = "/" + classification
    }

    list += "<li>"
    list +=
      '<a href="' + href + '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  if (!data || data.length === 0) {
    return '<p class="notice car-card empty">No vehicles found.</p>'
  }

  let grid = '<ul id="inv-display">'
  data.forEach(vehicle => {
    const thumbnailRaw = (vehicle.inv_thumbnail || '').trim()
    let thumbnail = '/images/site/placeholder.png'

    if (thumbnailRaw) {
      const imagesIndex = thumbnailRaw.indexOf('/images/')
      if (imagesIndex !== -1) {
        thumbnail = thumbnailRaw.slice(imagesIndex)
      } else if (thumbnailRaw.startsWith('images/')) {
        thumbnail = '/' + thumbnailRaw
      } else {
        thumbnail = thumbnailRaw.startsWith('/') ? thumbnailRaw : '/' + thumbnailRaw
      }
    }

    console.log(`Inventory thumbnail debug: inv_id=${vehicle.inv_id}, inv_make=${vehicle.inv_make}, inv_model=${vehicle.inv_model}, inv_thumbnail=${vehicle.inv_thumbnail}, resolved=${thumbnail}`)

    grid += `
      <li class="car-card">
        <a href="/inv/detail/${vehicle.inv_id}">
          <img src="${thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
          <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <span>$${vehicle.inv_price}</span>
        </a>
      </li>
    `
  })
  grid += '</ul>'
  return grid
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildInventoryDetail = function (item) {
  if (!item) {
    return '<p class="notice">Vehicle details are not available.</p>'
  }

  const price = item.inv_price != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.inv_price) : 'N/A'
  const mileage = item.inv_miles != null ? new Intl.NumberFormat('en-US').format(item.inv_miles) + ' miles' : 'N/A'
  const year = item.inv_year || 'Unknown Year'
  const classification = item.classification_name || 'Unclassified'

  const imageSrc = item.inv_image || item.inv_thumbnail || '/images/site/placeholder.png'

  let description = item.inv_description || 'No description available at this time.'
  // Allow minimal simple HTML if provided but encode dangerous tags? We assume safe from database.

  return `
    <div class="inventory-detail">
      <div class="detail-image-wrapper">
        <img src="${imageSrc}" alt="${item.inv_make} ${item.inv_model}" class="detail-image" />
      </div>

      <section class="detail-info">
        <h2>${year} ${item.inv_make || 'Unknown Make'} ${item.inv_model || 'Unknown Model'}</h2>
        <p><strong>Classification:</strong> ${classification}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage}</p>
        <p><strong>Vehicle ID:</strong> ${item.inv_id}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
      </section>
    </div>
  `
}

/* ****************************************
* Middleware For Handling Errors
**************************************** */
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }
 
module.exports = Util