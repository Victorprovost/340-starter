document.addEventListener("DOMContentLoaded", () => {
  const classificationSelect = document.getElementById("classificationList")
  const inventoryDisplay = document.getElementById("inventoryDisplay")

  if (!classificationSelect || !inventoryDisplay) return

  function clearInventoryDisplay() {
    inventoryDisplay.innerHTML = ""
  }

  function buildTableRows(items) {
    if (!items || items.length === 0) {
      return "<tr><td colspan=6>No inventory items found for this classification.</td></tr>"
    }

    let html = ""
    items.forEach(item => {
      html += "<tr>"
      html += `<td>${item.inv_make}</td>`
      html += `<td>${item.inv_model}</td>`
      html += `<td>${item.classification_name}</td>`
      html += `<td>$${Number(item.inv_price).toFixed(2)}</td>`
      html += `<td><a href='/inv/detail/${item.inv_id}'>Details</a></td>`
      html += `<td><a href='/inv/update/${item.inv_id}'>Edit</a></td>`
      html += "</tr>"
    })
    return html
  }

  async function loadInventoryForClassification(classificationId) {
    if (!classificationId) {
      clearInventoryDisplay()
      return
    }

    try {
      const response = await fetch(`/inv/api/classification/${classificationId}`)
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      const items = await response.json()

      inventoryDisplay.innerHTML = `
        <thead>
          <tr>
            <th>Make</th>
            <th>Model</th>
            <th>Classification</th>
            <th>Price</th>
            <th>Detail</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          ${buildTableRows(items)}
        </tbody>
      `
    } catch (error) {
      inventoryDisplay.innerHTML = `<tr><td colspan='6'>Error loading inventory: ${error.message}</td></tr>`
    }
  }

  classificationSelect.addEventListener("change", (e) => {
    const classificationId = e.target.value
    loadInventoryForClassification(classificationId)
  })
})