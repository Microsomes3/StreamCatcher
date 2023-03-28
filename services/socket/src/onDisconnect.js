const aws = require('aws-sdk');


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});


module.exports.handler = async (event) => {
    //onconnect event
    const connectionId = event.requestContext.connectionId;

   //delete connection from table
    const params = {
        TableName: process.env.SOCKET_CONNECTIONS_TABLE,
        Key: {
            connectionId: connectionId,
        },
    };

    const result = await documentClient.delete(params).promise();

    return {
        statusCode: 200,
        body: 'Connected',
    };

}