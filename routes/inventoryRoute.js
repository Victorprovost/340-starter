// Needed Resources 
const express = require("express")
const { body } = require("express-validator")
const router = new express.Router() 
const invController = require("../controllers/invController")   // ← Correct import

// Route to build the inventory management view
router.get("/", invController.buildInventoryManagement);

// NEW: Route to show ALL vehicles
router.get("/all", invController.buildAllInventory)

// Route to build the add classification view
router.get("/add-classification", invController.buildAddClassification);

// Route to process the add classification form
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .isAlphanumeric()
    .withMessage("Classification name must contain only letters and numbers, with no spaces or special characters."),
  invController.createClassification
);

// Route to build the add inventory view
router.get("/add-inventory", invController.buildAddInventory);

// Route to process the add inventory form
router.post(
  "/add-inventory",
  body("classification_id")
    .trim()
    .notEmpty()
    .withMessage("Please choose a classification.")
    .isInt({ min: 1 })
    .withMessage("Please choose a valid classification."),
  body("inv_make")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Make is required.")
    .isLength({ max: 50 })
    .withMessage("Make must be 50 characters or fewer."),
  body("inv_model")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Model is required.")
    .isLength({ max: 50 })
    .withMessage("Model must be 50 characters or fewer."),
  body("inv_description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required."),
  body("inv_image")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Image path is required."),
  body("inv_thumbnail")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Thumbnail path is required."),
  body("inv_price")
    .trim()
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number."),
  invController.createInventory
);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// API route to get inventory by classification (JSON)
router.get("/api/classification/:classificationId", invController.getInventoryByClassificationJson);

// Route to build specific inventory item detail view
router.get("/detail/:invId", invController.buildItemDetail);

// Route to trigger an intentional 500 error
router.get("/error", invController.triggerError);

module.exports = router;