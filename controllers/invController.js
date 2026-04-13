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

    if (!data || data.length === 0) {
      const nav = await utilities.getNav()
      return res.render("inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: "<p class='notice'>Sorry, no vehicles available in this category.</p>"
      })
    }

    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()

    const classifications = await invModel.getClassifications()
    const classification = classifications.rows.find((row) => 
      row.classification_id === parseInt(classification_id, 10)
    )

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
 *  Build a single inventory item detail view + Reviews
 * ************************** */
invCont.buildItemDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId
    
    const item = await invModel.getInventoryById(invId)

    if (!item) {
      return res.status(404).render("errors/error", {
        title: "Item not found",
        message: `Item with ID ${invId} could not be found.`,
        nav: await utilities.getNav(),
      })
    }

    // Get reviews and average rating
    const reviews = await invModel.getReviewsByInvId(invId)
    const averageRating = await invModel.getAverageRating(invId)

    const nav = await utilities.getNav()
    const vehicleDetail = utilities.buildInventoryDetail(item)

    res.render("./inventory/detail", {
      title: `${item.inv_make} ${item.inv_model}`,
      nav,
      vehicleDetail,
      item,
      reviews,
      averageRating,
      loggedin: res.locals.loggedin || false
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
}

/* ***************************
 *  Add a new review (POST) - With Validation
 * ************************** */
invCont.addReview = async function (req, res, next) {
  try {
    const { inv_id, rating, review_text } = req.body
    const account_id = req.session.accountData?.account_id

    // Validation
    if (!account_id) {
      req.flash("notice", "You must be logged in to leave a review.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    if (!rating || rating < 1 || rating > 5) {
      req.flash("notice", "Please select a valid rating between 1 and 5 stars.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    if (!review_text || review_text.trim().length < 10) {
      req.flash("notice", "Your review must be at least 10 characters long.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    await invModel.addReview(inv_id, account_id, parseInt(rating), review_text.trim())

    req.flash("notice", "✅ Thank you! Your review has been posted successfully.")
    res.redirect(`/inv/detail/${inv_id}`)

  } catch (error) {
    console.error("addReview error:", error)
    req.flash("notice", "Sorry, something went wrong. Please try again.")
    res.redirect(`/inv/detail/${req.body.inv_id || ''}`)
  }
}

/* ***************************
 *  Build ALL inventory view 
 * ************************** */
invCont.buildAllInventory = async function (req, res, next) {
  try {
    const data = await invModel.getAllInventory()

    if (!data || data.length === 0) {
      const nav = await utilities.getNav()
      return res.render("inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: "<p class='notice'>Sorry, no vehicles available.</p>"
      })
    }

    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()

    res.render("./inventory/classification", {
      title: "All Vehicles",
      nav,
      grid,
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
    const classificationList = await utilities.buildClassificationList()

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
    })
  } catch (error) {
    next(error)
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
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const item = await invModel.getInventoryById(invId)

    if (!item) {
      return res.status(404).render("errors/error", {
        title: "Item not found",
        message: `Item with ID ${invId} could not be found.`,
      })
    }

    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(item.classification_id)

    res.render("./inventory/edit-inventory", {
      title: `Edit ${item.inv_make} ${item.inv_model}`,
      nav,
      classificationList,
      item,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  API: Get inventory by classification (JSON)
 * ************************** */
invCont.getInventoryByClassificationJson = async function (req, res, next) {
  try {
    const classificationId = req.params.classificationId
    const inventoryItems = await invModel.getInventoryByClassificationId(classificationId)
    res.json(inventoryItems)
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

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
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
        classificationList: await utilities.buildClassificationList(),
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
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    }

    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont