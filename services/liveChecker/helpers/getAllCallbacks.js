const aws = require("aws-sdk");


const documentReader = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1"
});


module.exports.getAllCallbacks = async (username) => {
    
    const params = {
        TableName: process.env.CALLBACK_URLS_FOR_LIVE_YOUTUBERS_TABLE || "CallBackUrlsForLiveYoutubers",
        IndexName: 'username-index',
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": username,
        },
    };
    
    const result= await documentReader.query(params).promise();

    return {
        results: result.Items|| [],
    }
}

