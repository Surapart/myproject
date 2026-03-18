const mysql = require('mysql2/promise');

let conn = null;

const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'inventory_db',
        port: 8700
    });
    console.log('Connected to MySQL database');
};

const getConn = () => conn;

module.exports = { initMySQL, getConn };