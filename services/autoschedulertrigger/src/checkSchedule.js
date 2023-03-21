const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});

module.exports.handler = async (event) => {
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            input: event,
        }),
    };
};