
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

const sqs = new AWS.SQS({
    region: process.env.AWS_REGION_T
});

const moment = require('moment');
module.exports.addYoutuberUsername = async (event, context, callback) => {
    //username from body
    const { username, type } = JSON.parse(event.body);
    //username from query string

    if (typeof username !== 'string' || !username) {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t add the youtuber username..',
        });
        return;
    }

    if (typeof type !== 'string' || !type) {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t add the youtuber username..',
        });
        return;
    }

    const params = {
        TableName: process.env.YOUTUBERS_TO_CHECK_TABLE,
        Item: {
            youtubeusername: username,
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
            type,
            priority: 0
        },
    };
    await dynamoDb.put(params).promise();

    const cur = {
        youtubeusername: username,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
        type,
        priority: 0
    }

    const params2 = {
        MessageBody: JSON.stringify(cur),
        QueueUrl: process.env.YOUTUBERS_TO_CHECK_QUEUEUrl || "https://sqs.us-east-1.amazonaws.com/574134043875/YoutubersToCheckQueue"
    };

    const c = await sqs.sendMessage(params2).promise();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
            params: params,
        }),
    }

}