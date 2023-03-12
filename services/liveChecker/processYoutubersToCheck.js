const aws = require("aws-sdk");
const moment = require("moment");
const axios = require("axios");

const { checkLIVE } = require('./helpers/checkLive');

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

module.exports.processYoutubersToCheck = async (event) => {

    const username = event.Records[0].body;

    // const username = "@GriffinGaming";

    const liveStatus = await checkLIVE(username);

    console.log(liveStatus);

    // if (liveStatus.isLive) {
    //     const callbacks = await getAllCallbacks(username);

    //     for (let i = 0; i < callbacks.length; i++) {
    //         //post with 7 seconds timeout
    //         await axios.post(callbacks[i].callbackUrl, {
    //             username: username,
    //             isLive: liveStatus.isLive,
    //             liveStatus: liveStatus,
    //         }, {
    //             timeout: 7000,
    //         }).catch((err) => {
    //             console.log(err);
    //         }
    //         );
    //     }
    // }

        const params = {
            TableName: process.env.LIVE_CHECKER_TABLE,
            Item: {
                id: uuidv4(),
                createdAt: moment().unix(),
                updatedAt: moment().unix(),
                channel: username,
                status: JSON.stringify(liveStatus),
                isLive: liveStatus.isLive,
                liveLink: liveStatus.liveLink,
            },
        };

        await documentWriter.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Go Serverless v1.0! Your function executed successfully!',
                liveStatus: liveStatus,
            }),

        }
    }





