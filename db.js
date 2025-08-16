const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "recipes_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS recipes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            making_time VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            serves VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            ingredients VARCHAR(300) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            cost INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL
        )
    `;

    await pool.execute(createTableSQL);
    console.log("Recipes table is ready.");
  } catch (err) {
    console.error("Error ensuring table exists:", err);
  }
})();

module.exports = pool;