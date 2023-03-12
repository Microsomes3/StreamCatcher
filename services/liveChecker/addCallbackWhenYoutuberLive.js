const aws = require("aws-sdk");
const moment = require("moment");
const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});


function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

module.exports.addCallbackWhenYoutuberLive = async (event) => {
    const username = JSON.parse(event.body).username;
    const callbackUrl = JSON.parse(event.body).callbackUrl;

    if(!username || !callbackUrl){
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing username or callbackUrl",
            }),
        }
    }

    const params = {
        TableName: process.env.CALLBACK_URLS_FOR_LIVE_YOUTUBERS_TABLE,
        Item: {
            id: uuidv4(),
            callbackUrl: callbackUrl,
            username:username,
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
        },
    };

    await documentWriter.put(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            params: params,
        }),
    }
}