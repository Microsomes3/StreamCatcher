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

function createChannelWithAccount({
    channelName,
    platform,
    accountId
}) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            connection.beginTransaction((err) => {
                if (err) {
                    connection.release(); // Release the connection in case of error
                    reject(err);
                    return;
                }

                const createChannel = `INSERT INTO channels (channel_name, platform) VALUES (?,?)`;
                const addChannelToAccount = `INSERT INTO account_channels (account_id, channel_id) VALUES (?,?)`;

                connection.query(createChannel, [channelName, platform], (err, results, fields) => {
                    if (err) {
                        console.log(err.message);
                        connection.rollback(() => {
                            connection.release(); // Release the connection in case of error
                            reject(err);
                        });
                        return;
                    }

                    const channelId = results.insertId;

                    connection.query(addChannelToAccount, [accountId, channelId], (err, results, fields) => {
                        if (err) {
                            console.log(err.message);
                            connection.rollback(() => {
                                connection.release(); // Release the connection in case of error
                                reject(err);
                            });
                            return;
                        }

                        connection.commit((err) => {
                            if (err) {
                                console.log(err.message);
                                connection.rollback(() => {
                                    connection.release(); // Release the connection in case of error
                                    reject(err);
                                });
                                return;
                            }

                            connection.release(); // Release the connection after successful commit
                            resolve(channelId);
                        });
                    });
                });
            });
        });
    });
}

function getChannel({
    channelName,
    platform
}){
    return new Promise((resolve,reject)=>{
        const getChannelQuery = `SELECT * FROM channels WHERE channel_name = ? AND platform = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getChannelQuery, [channelName, platform], (err, results, fields) => {
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

function getChannelById({id}){
    return new Promise((resolve,reject)=>{
        const getChannelByIdQuery = `SELECT * FROM channels WHERE id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getChannelByIdQuery, [id], (err, results, fields) => {
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

function updateChannelLiveStatus({
    username,
    isLive,
}){
    return new Promise((resolve,reject)=>{
        const updateChannelLiveStatusQuery = `UPDATE channels SET isLive = ? WHERE channel_name = ?`;

        pool.getConnection((err, connection) => {
            connection.query(updateChannelLiveStatusQuery, [isLive, username], (err, results, fields) => {
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
    recordingId,
    accountId,
    channelId,
    status,
    scheduleId,
    resultText
}) {
    return new Promise((resolve, reject) => {
        const addRecordingQuery = `INSERT INTO recordings (recording_id,account_id, channel_id, status,result_text,record_schedule_id) VALUES (?,?,?,?,?,?)`;

        pool.getConnection((err, connection) => {
            connection.beginTransaction(async (err) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }

                connection.query(addRecordingQuery, [recordingId,accountId, channelId, status, resultText, scheduleId], async (err, results, fields) => {
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

function getRecording({
    id
}){
    return new Promise((resolve,reject)=>{
        const getRecordingQuery = `SELECT * FROM recordings WHERE id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getRecordingQuery, [id], (err, results, fields) => {
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

function getRecordingByRecordingId({
    recordingId
}){
    return new Promise((resolve,reject)=>{
        const getRecordingByRecordingIdQuery = `SELECT * FROM recordings WHERE recording_id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getRecordingByRecordingIdQuery, [recordingId], (err, results, fields) => {
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
//     recordingId:1,
//     accountId: 1,
//     channelId: 1,
//     status: "pending",
//     scheduleId: 1,
//     resultText: "test"

// }).then((result) => {
//     console.log(result);
// })





// getRecording({
//     recordingId:6
// }).then((res)=>{
//     console.log(res);
// })



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

function getRecordScheduleById({
    recordScheduleId, accountId
}){
    return new Promise((resolve,reject)=>{
        const getRecordScheduleByIdQuery = `SELECT * FROM record_schedule WHERE id = ? AND account_id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(getRecordScheduleByIdQuery, [recordScheduleId, accountId], (err, results, fields) => {
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

function deleteRecordingScheduleById({
    recordScheduleId, accountId
}){
    return new Promise((resolve,reject)=>{
        const deleteRecordingScheduleByIdQuery = `DELETE FROM record_schedule WHERE id = ? AND account_id = ?`;

        pool.getConnection((err, connection) => {
            connection.query(deleteRecordingScheduleByIdQuery, [recordScheduleId, accountId], (err, results, fields) => {
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
    getAutoSchedule,
    createChannelWithAccount,
    getChannel,
    getChannelById,
    getRecordScheduleById,
    deleteRecordingScheduleById,
    updateChannelLiveStatus,
    getRecordingByRecordingId,
}