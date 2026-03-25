const { Pool } = require("pg"); // ✅ correct
require("dotenv").config();
/*********
 * Connection pool
 * SSL Object needed for local testing of app
 * but will cause problems in production environment
 * IF - else will make determination which to use
 */


let pool;

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
// Added for troubleshooting queries
// during development
  // For development logging
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("executed query", { text });
        return res;
      } catch (error) {
        console.error("error in query", { text });
        throw error;
      }
    },
  };

} else {
  pool = new Pool({ // ✅ capital P
    connectionString: process.env.DATABASE_URL, // ✅ fixed typo
  });

  module.exports = pool;
}