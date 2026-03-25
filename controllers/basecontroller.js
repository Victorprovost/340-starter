const path = require("path")

function loadUtilities() {
  const appRoot = require.main ? path.dirname(require.main.filename) : process.cwd()
  const candidates = [
    path.join(__dirname, "..", "..", "utilities"),    // 340-starter/controllers -> root/utilities
    path.join(__dirname, "..", "utilities"),          // src/controllers -> src/utilities
    path.join(__dirname, "utilities"),                  // controllers and utilities same folder
    path.join(appRoot, "utilities"),                    // server root/app root
    path.join(appRoot, "..", "utilities"),            // server in src, utilities in parent
    path.join(appRoot, "340-starter", "utilities"),   // app root is project src
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