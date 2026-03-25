const invModel = require("../models/inventory-model")
const utilities = require("../../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()

    // Find classification_name from all classifications (this is safe and permits zero inventory)
    const classifications = await invModel.getClassifications()
    const classification = classifications.rows.find((row) => row.classification_id === parseInt(classification_id, 10))

    if (!classification) {
      return res.status(404).render("errors/error", {
        title: "404",
        message: "Classification not found.",
        nav,
      })
    }

    res.render("./inventory/classification", {
      title: classification.classification_name + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build a single inventory item detail view
 * ************************** */
invCont.buildItemDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const item = await invModel.getInventoryById(invId)

    if (!item) {
      return res.status(404).render("errors/error", {
        title: "Item not found",
        message: `Item with ID ${invId} could not be found. Don't worry, the flux capacitor is still charged!`,
      })
    }

    const nav = await utilities.getNav()
    const vehicleDetail = utilities.buildInventoryDetail(item)

    res.render("./inventory/detail", {
      title: `${item.inv_make} ${item.inv_model}`,
      nav,
      vehicleDetail,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Trigger an intentional error
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  throw new Error("This is an intentional 500-type error for demonstration purposes!")
}

 module.exports = invCont