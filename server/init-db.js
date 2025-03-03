const mysql = require('mysql2/promise');
require('dotenv').config();
import { sql } from './db.js';
async function initializeDatabase() {
  try {
    sql();
    // First, connect without database to create it if it doesn't exist
    // const connection = await mysql.createConnection({
    //   host: process.env.DB_HOST,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD
    // });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Drop existing tables if they exist
    await connection.query(`DROP TABLE IF EXISTS password_history`);
    await connection.query(`DROP TABLE IF EXISTS passwords`);
    console.log('Existing tables dropped');

    // Create passwords table
    await connection.query(`
      CREATE TABLE passwords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        password_value VARCHAR(50) NOT NULL,
        length INT NOT NULL,
        has_alphabets BOOLEAN DEFAULT true,
        has_numbers BOOLEAN DEFAULT false,
        has_symbols BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description VARCHAR(255),
        label VARCHAR(50)
      )
    `);
    console.log('Passwords table created');

    // Create password_history table
    await connection.query(`
      CREATE TABLE password_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        password_id INT,
        action VARCHAR(20),
        action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (password_id) REFERENCES passwords(id) ON DELETE SET NULL
      )
    `);
    console.log('Password history table created');

    // Insert some test data
    const [passwordResult] = await connection.query(`
      INSERT INTO passwords (password_value, length, has_alphabets, has_numbers, has_symbols, label)
      VALUES ('TestPassword123!', 14, true, true, true, 'Test Password')
    `);

    await connection.query(`
      INSERT INTO password_history (password_id, action)
      VALUES (?, 'CREATE')
    `, [passwordResult.insertId]);

    console.log('Test data inserted');

    await connection.end();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

initializeDatabase();
