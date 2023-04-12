const aws = require('aws-sdk');
const moment = require("moment");
const { sendShitpostLink, sendToUser } = require('./helpers/discordHelper')

const documentClient = new aws.DynamoDB.DocumentClient(
    {
        region: process.env.AWS_REGION_T,
    }
);

module.exports.handler = async (event) => {
    const data = JSON.parse(event.body);

    const { Job, Status } = data

    const { jobId, reqId, youtubeLink, channelName } = Job;

    const { state, result, time } = Status;

    console.log({
        message: 'GoUpdateCallback',
        jobId,
        state,
        result,
        time
    })



    if (state == "done") {

        try {
            await sendShitpostLink(`- ${result[0]}`);
        } catch (e) { 
            console.log(e);
        }
    }

    const params = {
        TableName: process.env.RECORD_TABLE,
        Item: {
            id: jobId,
            recordrequestid: reqId,
            date: moment().format("YYYY-MM-DD"),
            keys: [result],
            status: state,
            username: channelName,
            createdAt: new Date().getTime(),
            friendlyName: "--"
        },
    };

    try {
        await documentClient.put(params).promise();
    } catch (err) {
        console.log(err);
    }


    const params2 = {
        TableName: process.env.RecordStatusesTable,
        Key: {
            id: jobId
        },
        UpdateExpression: "set #status = :s, #date = :d",
        ExpressionAttributeNames: {
            "#status": "status",
            "#date": "timeended" // add this line
        },
        ExpressionAttributeValues: {
            ":s": state,
            ":d": moment().unix() // add this line to set the date value to the current time in ISO format
        }
    };

    try {
        await documentClient.update(params2).promise();
    } catch (err) {
        console.log(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'GoUpdateCallback',
            jobId,
            state,
            result,
            time,
            reqId,
            youtubeLink,
            channelName
        }),
    };
}