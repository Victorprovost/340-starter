const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const { validationResult } = require("express-validator")

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
 *  Build inventory management view
 * ************************** */
invCont.buildInventoryManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process add classification form
 * ************************** */
invCont.createClassification = async function (req, res, next) {
  try {
    const errors = validationResult(req)
    const nav = await utilities.getNav()

    if (!errors.isEmpty()) {
      return res.status(400).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),
        classification_name: req.body.classification_name,
      })
    }

    const classification_name = req.body.classification_name
    const regResult = await invModel.addClassification(classification_name)

    if (regResult && regResult.rows && regResult.rows[0]) {
      req.flash(
        "notice",
        `Classification '${classification_name}' was added successfully.`
      )
      const updatedNav = await utilities.getNav()
      return res.render("./inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
      })
    }

    const failureMessage =
      typeof regResult === "string"
        ? regResult
        : "Sorry, the classification could not be added."
    req.flash("notice", failureMessage)
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: [{ msg: failureMessage }],
      classification_name: req.body.classification_name,
    })
  } catch (error) {
    const nav = await utilities.getNav()
    req.flash("notice", "Sorry, the classification could not be added.")
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: [{ msg: error.message }],
      classification_name: req.body.classification_name,
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process add inventory form
 * ************************** */
invCont.createInventory = async function (req, res, next) {
  try {
    const errors = validationResult(req)
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )

    if (!errors.isEmpty()) {
      return res.status(400).render("./inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: errors.array(),
        classification_id: req.body.classification_id,
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
      })
    }

    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
    } = req.body

    const regResult = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price
    )

    if (regResult && regResult.rows && regResult.rows[0]) {
      req.flash(
        "notice",
        `New inventory item ${inv_make} ${inv_model} was added successfully.`
      )
      const updatedNav = await utilities.getNav()
      return res.render("./inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
      })
    }

    const failureMessage =
      typeof regResult === "string"
        ? regResult
        : "Sorry, the inventory item could not be added."
    return res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: [{ msg: failureMessage }],
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
    })
  } catch (error) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )
    return res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: [{ msg: error.message }],
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
    })
  }
}

/* ***************************
 *  Trigger an intentional error
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  throw new Error("This is an intentional 500-type error for demonstration purposes!")
}

 module.exports = invCont