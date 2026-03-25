const path = require("path")

function loadUtilities() {
  const candidates = [
    path.join(__dirname, "..", "..", "utilities"),
    path.join(__dirname, "..", "utilities"),
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

  throw new Error("Unable to locate utilities module in known paths.")
}

const utilities = loadUtilities()
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}

module.exports = baseController