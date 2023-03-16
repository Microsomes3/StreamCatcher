const aws = require("aws-sdk");
const moment = require("moment");
const axios = require("axios");

const { checkMultiLive } = require('./helpers/checkLive');

const { getAllCallbacks } = require("./helpers/getAllCallbacks.js");


const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function processLiveStatus(liveStatus) {
    return new Promise(async (resolve, reject) => {
        try {

            const username = liveStatus.username;

            if (liveStatus.isLive) {
                const callbacks = await getAllCallbacks(username);

                for (let i = 0; i < callbacks.results.length; i++) {

                    const curl = callbacks.results[i].callbackUrl;

                    await axios.post(curl, {
                        username: username,
                        isLive: liveStatus.isLive,
                        liveStatus: liveStatus,
                    }, {
                        timeout: 7000,
                    }).catch((err) => {
                        console.log(err);
                    }
                    );
                }


            }
        } catch (e) {

            console.log("error", e);
        }

        const params = {
            TableName: process.env.LIVE_CHECKER_TABLE,
            Item: {
                id: uuidv4(),
                createdAt: moment().unix(),
                updatedAt: moment().unix(),
                channel: liveStatus.username,
                status: JSON.stringify(liveStatus),
                isLive: liveStatus.isLive,
                liveLink: liveStatus.liveLink,
            },
        };

        await documentWriter.put(params).promise();

    })
}


function sendRecordServiceCallback(liveStatus) {
    return new Promise(async (resolve, reject) => {
        try {
            axios.post(process.env.CALLBACK_FOR_RECORD_SERVICE, {
                username: liveStatus.username,
                isLive: liveStatus.isLive,
                liveStatus: liveStatus,
            });
            resolve();
        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}

module.exports.processYoutubersToCheck = async (event) => {
    const allUsernames = [];

    for (let i = 0; i < event.Records.length; i++) {
        allUsernames.push(event.Records[i].body);

    }

    const liveStatuses = await checkMultiLive(allUsernames);

    for (let i = 0; i < liveStatuses.length; i++) {
        console.log(liveStatuses[i]);
        await sendRecordServiceCallback(liveStatuses[i]);
        await processLiveStatus(liveStatuses[i]);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
            liveStatus: liveStatus,
        }),

    }
}





