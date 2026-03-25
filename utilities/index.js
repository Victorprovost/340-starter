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

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = "" 
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
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

module.exports = Util