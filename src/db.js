// src/db.js
const mysql = require('mysql2/promise');
const { DB } = require('./config');

const pool = mysql.createPool({
    ...DB,
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = { pool };
