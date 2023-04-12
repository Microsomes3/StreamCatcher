require("dotenv").config(
    {
        path: "../.env"
    }
)

const pool = require('../db.js');


function createBillingItem({
    accountId,
    points,
    amount,
    stripeId
}){
    return new Promise((resolve,reject)=>{
        const createBillingItemQuery = `INSERT INTO billing (account_id, points, amount, stripe_id) VALUES (?,?,?,?)`;

        pool.getConnection((err, connection) => {
            connection.query(createBillingItemQuery, [accountId, points, amount, stripeId], (err, results, fields) => {
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

function getBillingItems({
    accountId

}){
    return new Promise((resolve,reject)=>{
        const getBillingItemsQuery = `SELECT * FROM billing WHERE account_id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getBillingItemsQuery, [accountId], (err, results, fields) => {
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

function getTotalBillingPoints({
    accountId
}){
    return new Promise((resolve,reject)=>{
        const getTotalBillingPointsQuery = `SELECT SUM(points) as points FROM billing WHERE account_id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getTotalBillingPointsQuery, [accountId], (err, results, fields) => {
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

function addChargePoints({
    accountId,
    points
}){
    return new Promise((resolve,reject)=>{
        const addChargePointsQuery = "INSERT INTO points_used (account_id, points) VALUES (?,?)";

        pool.getConnection((err, connection) => {
            connection.query(addChargePointsQuery, [accountId, points], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        })
    })
}

function getChargesPoints({
    accountId
}){
    return new Promise((resolve,reject)=>{
        const getChargesPointsQuery = "SELECT * FROM points_used WHERE account_id = ?";

        pool.getConnection((err, connection) => {
            connection.query(getChargesPointsQuery, [accountId], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        })
    })
}

function getTotalChargePoints({
    accountId
}){
    return new Promise((resolve,reject)=>{
        const getTotalChargePointsQuery = "SELECT SUM(points) as points FROM points_used WHERE account_id = ?";

        pool.getConnection((err, connection) => {
            connection.query(getTotalChargePointsQuery, [accountId], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        })
    })
}

function getTotalPoints({
    accountId
}){
    //total billing points - total charge points
    return new Promise(async (resolve,reject)=>{
        const totalBillingPoints = await getTotalBillingPoints({
            accountId
        });

        const bp = parseInt(totalBillingPoints[0].points)
        if (!isNaN(bp)){
            console.log(bp)

            const totalChargePoints = await getTotalChargePoints({
                accountId
            });
            
            const cp = parseInt(totalChargePoints[0].points)

            if (!isNaN(cp)){
                console.log(cp)
                resolve(bp - cp)
            }else{
                resolve(0)
            }

        }else{
            resolve(0)
        }
    })
}

function createPromoCode({
    code,
    points
}){
    return new Promise((resolve,reject)=>{
        const createPromoCodeQuery = "INSERT INTO promo_codes (code, points) VALUES (?,?)";

        pool.getConnection((err, connection) => {
            connection.query(createPromoCodeQuery, [code, points], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        })
    })
}

function getAllPromoCodes(){
    return new Promise((resolve,reject)=>{
        const getAllPromoCodesQuery = "SELECT * FROM promo_codes";

        pool.getConnection((err, connection) => {
            connection.query(getAllPromoCodesQuery, (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        })
    })
}

function getPromoCode({
    code
}){
    return new Promise((resolve,reject)=>{
        const getPromoCodeQuery = "SELECT * FROM promo_codes WHERE code = ?";

        pool.getConnection((err, connection) => {
            connection.query(getPromoCodeQuery, [code], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }

                resolve(results);
            });

            //release connection
            connection.release();

        })
    })
}

function applyPromoCode({
    accountId,
    code
}){
    return new Promise(async (resolve,reject)=>{
        const promoCode = await getPromoCode({
            code
        });

        if (promoCode.length > 0){
            const points = promoCode[0].points;
            const isUsed = promoCode[0].used;

            if (isUsed == 1){
                reject("Promo code already used");
            }

            pool.getConnection((err, connection) => {

                //start transaction
                connection.beginTransaction((err)=>{

                    //add points to billingtable and mark pronocode as used

                    const addPointsQuery = "INSERT INTO billing (account_id, points,paymentmethod,stripe_id,amount) VALUES (?,?,?,?,?)";
                    const markPromoCodeAsUsedQuery = "UPDATE promo_codes SET used = 1 WHERE code = ?";

                    connection.query(addPointsQuery, [accountId, points, "promo", code, 0], (err, results, fields) => {
                        if (err) {
                            console.log(err.message);
                            reject(err);
                        }

                        connection.query(markPromoCodeAsUsedQuery, [code], (err, results, fields) => {
                            if (err) {
                                console.log(err.message);
                                reject(err);
                            }

                            connection.commit((err)=>{
                                if (err) {
                                    console.log(err.message);
                                    reject(err);
                                }

                                resolve({
                                    message: "Promo code applied"
                                })
                            })

                        });

                    });

                })

            })

            // const addPoints = await addChargePoints({
            //     accountId,
            //     points
            // });

            // resolve(addPoints);
        }else{
            resolve({
                error: "Promo code not found"
            })
        }
    })
}


module.exports = {
    createBillingItem,
    getBillingItems,
    getTotalBillingPoints,
    addChargePoints,
    getChargesPoints,
    getTotalPoints,
    createPromoCode,
    applyPromoCode,
    getAllPromoCodes
}