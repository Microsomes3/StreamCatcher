require('dotenv').config();
const pool = require('./db.js');




function createAccountTable(){
    pool.getConnection((err, connection) => {

        //create accounts table if not exists, it needs auto increment id, username, password, when created


        //drop table if exists
        const dropAccountsTable = `DROP TABLE IF EXISTS accounts`;

        // connection.query(dropAccountsTable, (err, results, fields) => {
        //     if (err) {
        //         console.log(err.message);
        //     }

        //     console.log('Accounts table dropped');
        //     console.log(results);
        // });
    
        const createAccountsTable = `CREATE TABLE IF NOT EXISTS accounts (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY (username)
        )`;
    
        connection.query(createAccountsTable, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }
    
            console.log('Accounts table created');
            console.log(results);
        });
    
        //release connection
        connection.release();
    
    });
}


function createStreamTrackerTable(){
    pool.getConnection((err, connection) => {

        //create a table called channels, it should have channel name, platform, created 

        //also create a table to link account to channels, it should be one to many

        const recordingsTable = `CREATE TABLE IF NOT EXISTS recordings (
            id INT NOT NULL AUTO_INCREMENT,
            account_id INT NOT NULL,
            channel_id INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (account_id) REFERENCES accounts(id),
            FOREIGN KEY (channel_id) REFERENCES channels(id)
        )`;

        const recordingEvents = `CREATE TABLE IF NOT EXISTS recording_events (
            id INT NOT NULL AUTO_INCREMENT,
            recording_id INT NOT NULL,
            event VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (recording_id) REFERENCES recordings(id)
        )`;

        const recordSchedule = `CREATE TABLE IF NOT EXISTS record_schedule (
            id INT NOT NULL AUTO_INCREMENT,
            account_id INT NOT NULL,
            channel_id INT NOT NULL,
            duration INT NOT NULL,
            recordStart VARCHAR(255) NOT NULL,
            label VARCHAR(255) NOT NULL,
            triggerMode VARCHAR(255) NOT NULL,
            triggerInterval INT NOT NULL,
            triggerTime VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (account_id) REFERENCES accounts(id),
            FOREIGN KEY (channel_id) REFERENCES channels(id)
        )`;

        const autoSchedule = `CREATE TABLE IF NOT EXISTS auto_schedule (
            id INT NOT NULL AUTO_INCREMENT,
            account_id INT NOT NULL,
            channel_id INT NOT NULL,
            record_schedule_id INT NOT NULL,
            mode VARCHAR(255) NOT NULL,
            hour INT NOT NULL,
            minute INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (account_id) REFERENCES accounts(id),
            FOREIGN KEY (channel_id) REFERENCES channels(id),
            FOREIGN KEY (record_schedule_id) REFERENCES record_schedule(id)
        )`;

        //drop table 
        // const dropScheduleTable = `DROP TABLE IF EXISTS auto_schedule`;

        // connection.query(dropScheduleTable, (err, results, fields) => {
        //     if (err) {
        //         console.log(err.message);
        //     }

        //     console.log('Auto Schedule table dropped');
        //     console.log(results);
        // });

        // return; 

        const recordScheduleEvents = `CREATE TABLE IF NOT EXISTS record_schedule_events (
            id INT NOT NULL AUTO_INCREMENT,
            record_schedule_id INT NOT NULL,
            event VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (record_schedule_id) REFERENCES record_schedule(id)
        )`;

        connection.query(autoSchedule, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }

            console.log('Auto Schedule table created');
            console.log(results);
        });


        connection.query(recordingsTable, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }

            console.log('Recordings table created');
            console.log(results);
        });

        connection.query(recordingEvents, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }

            console.log('Recording Events table created');
            console.log(results);
        });

        connection.query(recordSchedule, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }

            console.log('Record Schedule table created');
            console.log(results);
        });
        
        connection.query(recordScheduleEvents, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }

            console.log('Record Schedule Events table created');
            console.log(results);
        });


        const createChannelsTable = `CREATE TABLE IF NOT EXISTS channels (
            id INT NOT NULL AUTO_INCREMENT,
            channel_name VARCHAR(255) NOT NULL,
            platform VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            isLive BOOLEAN NOT NULL DEFAULT FALSE,
            PRIMARY KEY (id),
            UNIQUE KEY (channel_name, platform)
        )`;

        const createAccountChannelsTable = `CREATE TABLE IF NOT EXISTS account_channels (
            id INT NOT NULL AUTO_INCREMENT,
            account_id INT NOT NULL,
            channel_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (account_id) REFERENCES accounts(id),
            FOREIGN KEY (channel_id) REFERENCES channels(id),
            UNIQUE KEY (account_id, channel_id)
        )`;

        connection.query(createChannelsTable, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }
    
            console.log('Channels table created');
            console.log(results);
        })

        connection.query(createAccountChannelsTable, (err, results, fields) => {
            if (err) {
                console.log(err.message);
            }
    
            console.log('Account Channels table created');
            console.log(results);
        })


    })

}

createAccountTable();
createStreamTrackerTable();