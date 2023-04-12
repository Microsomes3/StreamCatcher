require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const pool = require('../db.js');

function createAccount({ username, password }) {
    return new Promise((resolve, reject) => {
      const createAccountQuery = `INSERT INTO accounts (username, password) VALUES (?,?)`;
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          reject(err);
        } else {
          pool.getConnection((err, connection) => {
            if (err) {
              reject(err);
            } else {
              connection.query(createAccountQuery, [username, hashedPassword], (err, results, fields) => {
                if (err) {
                  console.log(err.message);
                  reject(err);
                } else {
                  console.log('Account created');
                  console.log(results);
                  resolve(results.insertId);
                }
              });
              connection.release();
            }
          });
        }
      });
    });
  }

function getAccountById({ id }) {
    return new Promise((resolve, reject) => {
        const getAccountByIdQuery = `SELECT * FROM accounts WHERE id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAccountByIdQuery, [id], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function getAccountByUsername({ username }) {
    return new Promise((resolve, reject) => {
        const getAccountByUsernameQuery = `SELECT * FROM accounts WHERE username = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAccountByUsernameQuery, [username], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

async function signInWithUsernameAndPassword({ username, password }) {
    return new Promise((resolve, reject) => {
        const signInWithUsernameAndPasswordQuery = `SELECT * FROM accounts WHERE username = ?`;


        pool.getConnection((err, connection) => {
            connection.query(signInWithUsernameAndPasswordQuery, [username], async (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                if (results.length > 0) {
                    const account = results[0];
                    const passwordMatch = await bcrypt.compare(password, account.password);

                    if (passwordMatch) {
                        const token = jwt.sign({ id: account.id, username: account.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
                        resolve(token);
                    } else {
                        reject(new Error('Incorrect password'));
                    }
                } else {
                    reject(new Error('Account not found'));
                }
            });
        })


    })
}

module.exports = {
    createAccount,
    getAccountById,
    getAccountByUsername,
    signInWithUsernameAndPassword
}