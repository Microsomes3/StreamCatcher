const mysql = require('mysql2');

const user = "doadmin";
const pass = "AVNS_3W2-m3h25FCL4u6dxAW"
const host = "db-mysql-lon1-12933-do-user-8648433-0.b.db.ondigitalocean.com"
const port = 25060;

const db = "crons"

const connection = mysql.createConnection({
    host: host,
    user: user,
    password: pass,
    database: db,
    port: port
});

connection.connect(function(err) {
console.log("connected");
    if (err) throw err;
    console.log("Connected!");
    inittableCrons(connection).then((result)=>{
        console.log("table created");
    })

    // addCronItem(connection, "123", "2023-03-29", "15", "37").then((result)=>{
    //     console.log("item added");
    // });

    // getCronItemFromDateRequest(connection, "2020-10-10", "123").then((result)=>{
    //     console.log(result);
    // })

    // checkIfTaskExistsWithinDateAndRequest(connection, "2020-10-10", "123").then((result)=>{
    //     console.log(result);
    // })
    
    // checkIfTaskExistsWithTime(connection, "2023-03-29", "123", "16:38").then((result)=>{
    //     console.log(result);
    // })
});


function inittableCrons(connection){
    return new Promise((resolve,reject)=>{

    connection.query("CREATE TABLE IF NOT EXISTS crons (id INT AUTO_INCREMENT PRIMARY KEY, requestid VARCHAR(255), date VARCHAR(10), hour varchar(10),minute varchar(10), created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)", function (err, result) {
        if (err) reject(err);

        resolve(result);
        console.log("Table created");
    });
            
})
}

function checkIfTriggerTimeWithinSpecfiedTime(connection, date, requestid, triggertime){
    return new Promise((resolve,reject)=>{
    connection.query("SELECT * FROM crons WHERE date = ? AND requestid = ?", [date, requestid], function (err, result) {
        if (err) resolve(false)

        const hour = time.split(":")[0];
        const minute = time.split(":")[1];

        var toReturn = false;

        result.forEach((item)=>{
            if(item.hour == hour && item.minute == minute){
                toReturn = true;
            }
        })

        resolve(toReturn);

    });
})
}

function checkIfTaskExistsWithTime(connection, date, requestid, time){
  return new Promise((resolve,reject)=>{
    connection.query("SELECT * FROM crons WHERE date = ? AND requestid = ?", [date, requestid], function (err, result) {
        if (err) resolve(false)

        const hour = time.split(":")[0];
        const minute = time.split(":")[1];

        var toReturn = false;

        result.forEach((item)=>{
            if(item.hour == hour && item.minute == minute){
                toReturn = true;
            }
        })

        resolve(toReturn);

    });
  })
}

function checkIfTaskExistsWithinDateAndRequest(connection, date, requestid){
    return new Promise((resolve,reject)=>{
    connection.query("SELECT * FROM crons WHERE date = ? AND requestid = ?", [date, requestid], function (err, result) {
        if (err) resolve(false)
        
        var toReturn = false;


        if(result.length > 0){
            toReturn = true;
        }

        resolve(toReturn);

    });
})
}

function addCronItem(connection, requestid, date, hour, minute){
    return new Promise((resolve,reject)=>{
    connection.query("INSERT INTO crons (requestid, date, hour, minute) VALUES (?, ?, ?, ?)", [requestid, date, hour, minute], function (err, result) {
        if (err) reject(err);
        resolve(result);
    });
})
}

function getCronItemFromDateRequest(connection, date, requestid){
    return new Promise((resolve,reject)=>{
    connection.query("SELECT * FROM crons WHERE date = ? AND requestid = ?", [date, requestid], function (err, result) {
        if (err) reject(err);
        resolve(result);
    });
})
}


module.exports = {
    addCronItem,
    getCronItemFromDateRequest,
    checkIfTaskExistsWithinDateAndRequest,
    checkIfTaskExistsWithTime,
    inittableCrons
}