const mysql2 = require('mysql2');
const fs = require('fs');

const pool = mysql2.createPool({
    user: process.env.DO_USER,
    host: process.env.DO_HOST,
    password: process.env.DO_PASS,
    port: process.env.DO_PORT,
    database: process.env.DO_DB,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
   
});



//check connection

console.log('Checking DB connection...');

pool.getConnection((err, connection) => {
    console.log('DB connection checked');
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
        console.log(err);
    }
    if (connection) connection.release();
    console.log('DB is Connected');
    return;
});

module.exports = pool;



