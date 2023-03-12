const aws = require("aws-sdk");


module.exports.getCallbacksByUsername = async (event) => {

    try {
        const username = "@griffingaming"
        const documentReader = new aws.DynamoDB.DocumentClient({
            region: process.env.AWS_REGION_T
        });

        const params = {
            TableName: process.env.CALLBACK_URLS_FOR_LIVE_YOUTUBERS_TABLE,
            IndexName: 'username-index',
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
        };
        //scan

        const result= await documentReader.query(params).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                params: params,
                result: result,
                event: event,
            }),
        }
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing username",
                error: e,
            }),
        }
    }


}