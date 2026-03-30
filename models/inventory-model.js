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
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    // Return mock data for development
    console.log("Using mock inventory data for classification:", classification_id)
    return []
  }
}


async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name FROM public.inventory AS i
      JOIN public.classification AS c ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    // Return mock data for development
    console.log("Using mock inventory item data for id:", inv_id)
    return null
  }
}

module.exports = {getClassifications, addClassification, addInventory, getInventoryByClassificationId, getInventoryById};