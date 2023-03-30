
const { getAllRecordRequestsToSchedule } = require('./helpers/checkScheduleStandalone');
const aws = require('aws-sdk');

const moment = require('moment');

const { makeConnection, disconnect } = require('./helpers/db')

const mongoose = require('mongoose');
const mongoconnectionstring = process.env.MONGO_CONNECITON;

mongoose.connect(mongoconnectionstring, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected')
    })


const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

function handleFunc() {
    return new Promise(async (resolve, reject) => {


        const recordRequests = await getAllRecordRequestsToSchedule();


        console.log("total record requests to trigger", recordRequests.length);

        var flattenRecordRequests = recordRequests.flat(1);

        var messageIds = [];
        var allResponses = [];

        for (let i = 0; i < flattenRecordRequests.length; i++) {

            const param = {
                MessageBody: JSON.stringify({
                    ...flattenRecordRequests[i]
                }),
                QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL,
            }

            await sqs.sendMessage(param).promise();

            resolve({
                messageIds,
                flattenRecordRequests,
                allResponses
            })

        }

    })
}



module.exports.handler = async (event) => {

    try {
        const { messageIds, flattenRecordRequests, allResponses } = await handleFunc();

        const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

        return {
            statusCode: 200,
            body: JSON.stringify({
                currentTime: currentTime
            }),
        };
    } catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: e,
                currentTime: moment().format("YYYY-MM-DD HH:mm:ss")
            }),
        };
    }
};