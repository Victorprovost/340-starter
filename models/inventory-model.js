const pool = require("../database/")

/* ***************
 * Get all classification data
 * ***************** */
async function getClassifications() {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name ")
    return data
  } catch (error) {
    // Return mock data for development
    console.log("Using mock classification data")
    return {
      rows: [
        { classification_id: 1, classification_name: 'Custom' },
        { classification_id: 2, classification_name: 'Sedan' },
        { classification_id: 3, classification_name: 'Sport' },
        { classification_id: 4, classification_name: 'SUV' },
        { classification_id: 5, classification_name: 'Truck' }
      ]
    }
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price
) {
  try {
    const sql =
      "INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    return await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
    ])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getAllInventory() {
  try {
    const result = await pool.query(`
      SELECT * FROM public.inventory 
      ORDER BY classification_id, inv_make, inv_model
    `)
    return result.rows
  } catch (error) {
    console.error("getAllInventory error:", error)
    throw new Error("Could not retrieve inventory")
  }
}


/* ***************************
 *  Get inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1
       ORDER BY i.inv_make, i.inv_model`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    return []
  }
}

/* ***************************
 *  Get single inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error:", error)
    return null
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  addClassification,
  addInventory,
  getInventoryByClassificationId,
  getInventoryById,
  getAllInventory,
  updateInventory
}