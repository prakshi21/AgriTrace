require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Prakshi@7037',
            multipleStatements: true
        });

        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        await connection.query(schema);
        console.log("Database initialized successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Failed to initialize database:", error);
        process.exit(1);
    }
}

initDB();
