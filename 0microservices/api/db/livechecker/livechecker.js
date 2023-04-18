require("dotenv").config(
    {
        path: "../.env"
    }
)

const pool = require('../db.js');

const {
    createChannel,
    updateChannelLiveStatus
} = require('../record/record')

function addLiveEvent({
    username,
    isLive,
    platform
}) {
    return new Promise(async(resolve, reject) => {
        console.log("addLiveEvent", username, isLive, platform);

        try{
            await createChannel({
                channelName:username,
                platform
            })
           
        }catch(err){
            console.log("Error creating channel",err);
        }

        try{
            await updateChannelLiveStatus({
                username:username,
                isLive:isLive,
            })
        }catch(err){
            console.log("Error updating channel live status",err);
        }


        
        pool.query(
            `INSERT INTO live_checker (username, isLive,liveUpdatedAt) VALUES (?, ?, NOW())`,
            [username, isLive],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        )
    })
}

function getLiveEventByDate({
    username,
    date
}) {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM live_checker WHERE username = ? AND DATE(created_at) = ? order by id desc`,
            [username, date],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        )
    })
}

function totalLiveEvents(){
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT count(*) as total FROM live_checker`,
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        )
    })
}

totalLiveEvents().then((c) => {
    console.log(c);
})

function getChannelLiveEvent({
    username
}) {
    //should return the last live event
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM live_checker WHERE username = ? order by id desc limit 1`,
            [username],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        )
    })
}

function getAllChannelsLiveAggregateCurrent(){
    return new Promise((resolve, reject) => {
       //get all channels that have a live event on a given date latest one per channel

        const q =`SELECT username AS channel, 
        (SELECT isLive FROM live_checker 
         WHERE username = channel 
         ORDER BY id DESC 
         LIMIT 1) AS isLive 
        FROM live_checker 
        GROUP BY username`;

         pool.query(
            q,
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        )
    })
}

function getAllLiveEventDates(){
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT DISTINCT DATE(created_at) AS date FROM live_checker`,
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        )
    })
}


// getAllChannelsLiveAggregateCurrent().then((c) => {
//     console.log(c);
// })

// getChannelLiveEvent({
//     username: "test"
// }).then((res)=>{
//     console.log(res);
// })

// getLiveEventByDate({
//     username: "test",
//     date: "2023-04-14"
// }).then((c) => {
//     console.log(c);
// })

// addLiveEvent({
//     username: "matt",
//     isLive: false
// }).then((c)=>{
//     console.log(c);
// })



module.exports = {
    addLiveEvent,
    getLiveEventByDate,
    getChannelLiveEvent,
    getAllChannelsLiveAggregateCurrent,
    getAllLiveEventDates
}