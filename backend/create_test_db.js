const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.test' });

async function createDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
    });

    try {
        await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

createDatabase();
