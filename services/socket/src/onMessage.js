const aws = require('aws-sdk');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});



module.exports.handler = async (event) => {
    //onconnect event
    const connectionId = event.requestContext.connectionId;
    const message = JSON.parse(event.body).message;

    const params = {
        TableName: process.env.SOCKET_CONNECTIONS_TABLE,
        Item: {
            connectionId: connectionId,
            createdAt: Date.now(),
            status: 'connected',
            message: message,
        },
    };

    const result = await documentClient.put(params).promise();

    return {
        statusCode: 200,
        body: 'Connected',
    };

}