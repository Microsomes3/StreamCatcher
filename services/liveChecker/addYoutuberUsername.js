
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});
const moment = require('moment');
module.exports.addYoutuberUsername = async (event,context,callback) => {
    //username from body
    const username =  JSON.parse(event.body).username;
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


    const params = {
        TableName: process.env.YOUTUBERS_TO_CHECK_TABLE,
        Item: {
            youtubeusername: username,
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
            priority: 0
        },
    };
    await dynamoDb.put(params).promise();

    return {
        statusCode: 200,
        headers:{
            'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST',
      'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
            params: params,
        }),
    }

}