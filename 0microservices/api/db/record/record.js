require("dotenv").config(
    {
        path: "../.env"
    }
)

const pool = require('../db.js');

function createChannel({
    channelName,
    platform,
}){
    return new Promise((resolve,reject)=>{
        const createChannelQuery = `INSERT INTO channels (channel_name, platform) VALUES (?,?)`;

        pool.getConnection((err, connection) => {
            connection.query(createChannelQuery, [channelName, platform], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results.insertId);
            });

            //release connection
            connection.release();

        });
    })
}

function getAllChannels({
    platform,
    page
}){
    return new Promise((resolve,reject)=>{
        //total results per page = 20

        const getAllChannelsQuery = `SELECT * FROM channels WHERE platform = ? LIMIT 20 OFFSET ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAllChannelsQuery, [platform, page], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function addChannelToAccount({
    accountId,
    channelId
}){
    return new Promise((resolve,reject)=>{
        const addChannelToAccountQuery = `INSERT INTO account_channels (account_id, channel_id) VALUES (?,?)`;

        pool.getConnection((err, connection) => {
            connection.query(addChannelToAccountQuery, [accountId, channelId], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results.insertId);
            });

            //release connection
            connection.release();

        });
    })
}

function getAllChannelsByAccountId({
    accountId,
    page
}){
    return new Promise((resolve,reject)=>{
        //total results per page = 20

        const getAllChannelsByAccountIdQuery = `SELECT * FROM channels WHERE id IN (SELECT channel_id FROM account_channels WHERE account_id = ?) LIMIT 20 OFFSET ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAllChannelsByAccountIdQuery, [accountId, page], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function deleteChannelFromAccount({
    accountId,
    channelId
}){
    return new Promise((resolve,reject)=>{

        const deleteChannelFromAccountQuery = `DELETE FROM account_channels WHERE account_id = ? AND channel_id = ?`;

        pool.getConnection((err, connection) => {

            connection.query(deleteChannelFromAccountQuery, [accountId, channelId], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            })

        })

    })
}

function addRecording({
    accountId,
    channelId,
    status
}) {
    return new Promise((resolve, reject) => {
        const addRecordingQuery = `INSERT INTO recordings (account_id, channel_id, status) VALUES (?,?,?)`;

        pool.getConnection((err, connection) => {
            connection.beginTransaction(async (err) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                connection.query(addRecordingQuery, [accountId, channelId, status], async (err, results, fields) => {
                    if (err) {
                        console.log(err.message);
                        connection.rollback(() => {
                            reject(err);
                        });
                        return;
                    }

                    const recordingId = results.insertId;

                    const addRecordingEventQuery = `INSERT INTO recording_events (recording_id, event) VALUES (?,?)`;

                    connection.query(addRecordingEventQuery, [recordingId, "Recording created"], (err, results, fields) => {
                        if (err) {
                            console.log(err.message);
                            connection.rollback(() => {
                                reject(err);
                            });
                            return;
                        }

                        connection.commit((err) => {
                            if (err) {
                                console.log(err.message);
                                connection.rollback(() => {
                                    reject(err);
                                });
                                return;
                            }

                            resolve(recordingId);
                        });
                    });
                });
            });

            //release connection
            connection.release();
        });
    });
}

function getAllRecordings({
    accountId,
    page
}){
    return new Promise((resolve,reject)=>{
        //total results per page = 20

        const getAllRecordingsQuery = `SELECT * FROM recordings WHERE account_id = ? LIMIT 20 OFFSET ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAllRecordingsQuery, [accountId, page], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function addRecordingEvent({
    recordingId,
    event
}){
    return new Promise((resolve,reject)=>{
        const addRecordingEventQuery = `INSERT INTO recording_events (recording_id, event) VALUES (?,?)`;

        pool.getConnection((err, connection) => {
            connection.query(addRecordingEventQuery, [recordingId, event], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results.insertId);
            });

            //release connection
            connection.release();

        });
    })
}

function getAllRecordingEvents({
    recordingId
}){
    return new Promise((resolve,reject)=>{
        //total results per page = 20

        const getAllRecordingEventsQuery = `SELECT * FROM recording_events WHERE recording_id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAllRecordingEventsQuery, [recordingId], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function addRecordingSchedule({
    accountId,
    channelId,
    duration,
    recordStart,
    label,
    triggerMode,
    triggerInterval,
    triggerTime
}){
    return new Promise((resolve,reject)=>{
        const addRecordingScheduleQuery = `INSERT INTO record_schedule (account_id, channel_id, duration, recordStart, label, triggerMode, triggerInterval, triggerTime) VALUES (?,?,?,?,?,?,?,?)`;

        pool.getConnection((err, connection) => {
            connection.query(addRecordingScheduleQuery, [accountId, channelId, duration, recordStart, label, triggerMode, triggerInterval, triggerTime], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results.insertId);
            });

            //release connection
            connection.release();

        });
    })
}

function getAllRecordingSchedules({
    accountId,
    page
}){
    return new Promise((resolve,reject)=>{
        //total results per page = 20

        const getAllRecordingSchedulesQuery = `SELECT * FROM record_schedule WHERE account_id = ? LIMIT 20 OFFSET ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAllRecordingSchedulesQuery, [accountId, page], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function getAllRecordingSchedulesAll(){
    return new Promise((resolve,reject)=>{
        //total results per page = 20

        const getAllRecordingSchedulesQuery = `SELECT * FROM record_schedule`;

        pool.getConnection((err, connection) => {
            connection.query(getAllRecordingSchedulesQuery, (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })
}

function addAutoSchedule({
    accountId,
    channelId,
    recordScheduleId,
    mode,
    hour,
    minute
}){
    return new Promise((resolve,reject)=>{
        const addAutoScheduleQuery = `INSERT INTO auto_schedule (account_id, channel_id, record_schedule_id, mode, hour, minute) VALUES (?,?,?,?,?,?)`;

        pool.getConnection((err, connection) => {
            connection.query(addAutoScheduleQuery, [accountId, channelId, recordScheduleId, mode, hour, minute], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results.insertId);
            });

            //release connection
            connection.release();

        });
    })
}

function getAutoSchedule({
    recordScheduleId,
    accountId,
    date
}){
    return new Promise((resolve,reject)=>{
        const getAutoScheduleQuery = `SELECT * FROM auto_schedule WHERE record_schedule_id = ? AND account_id = ? AND DATE(created_at) = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getAutoScheduleQuery, [recordScheduleId, accountId, date], (err, results, fields) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                resolve(results);
            });

            //release connection
            connection.release();

        });
    })

}


// addRecording({
//     accountId: 1,
//     channelId: 1,
//     status:"pending"
// }).then((res)=>{
//     console.log(res);
// })


// getAllRecordings({
//     accountId: 1,
//     page: 0
// }).then((res)=>{
//     console.log(res);
// })

// getAllRecordingEv pents({
//     recordingId: 4
// }).then((res)=>{
//     console.log(res);
// })

// addRecordingSchedule({
//     accountId: 1,
//     channelId: 1,
//     duration: 60,
//     recordStart: "true",
//     label: "test",
//     triggerMode: "interval",
//     triggerInterval: 60,
//     triggerTime: "00:00:00",
// }).then((res)=>{
//     console.log(res);
// })

// getAllRecordingSchedules({accountId:1,page:0}).then((res)=>{
//     console.log(res);
// })


// getAllRecordingSchedulesAll().then((res)=>{
//     console.log(res);
// })


// getAutoSchedule({
//     recordScheduleId:1,
//     accountId:2,
//     date:"2023-04-12"
// }).then((res)=>{
//     console.log(res);
// })


// addAutoSchedule({
//     accountId:1,
//     channelId:1,
//     recordScheduleId:1,
//     mode:"wheneverlive",
//     hour:0,
//     minute:0
// }).then((res)=>{
//     console.log(res);
// })


module.exports = {
    createChannel,
    getAllChannels,
    addChannelToAccount,
    getAllChannelsByAccountId,
    deleteChannelFromAccount,
    addRecording,
    getAllRecordings,
    addRecordingEvent,
    getAllRecordingEvents,
    addRecordingSchedule,
    getAllRecordingSchedules,
    getAllRecordingSchedulesAll,
    addAutoSchedule,
    getAutoSchedule
}