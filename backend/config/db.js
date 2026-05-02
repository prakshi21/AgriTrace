require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Prakshi@7037',
  database: process.env.DB_NAME || 'seed',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(conn => {
        console.log("MySQL Connected Successfully 🔥");
        conn.release();
    })
    .catch(err => {
        console.log("Database connection failed:", err.message);
    });

module.exports = pool;