
const aws = require('aws-sdk');


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
    endpoint: "dynamodb.us-east-1.amazonaws.com"
});

const apigate = new aws.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: 'https://7hivo8j534.execute-api.us-east-1.amazonaws.com/dev',
    region: process.env.AWS_REGION_T || 'us-east-1',
});


function getSocketConnections(recordID) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.SOCKET_CONNECTIONS_TABLE || 'ConnectionTable'
        };

        const result = await documentClient.scan(params).promise();

        const connections = result.Items.filter((item) => {
            return item.recordid === recordID;
        })

        resolve(connections[0] || null);
    });
}

function sendSocketMessage(connectionId, message) {
    return new Promise(async (resolve, reject) => {
        const params = {
            ConnectionId: connectionId,
            Data: JSON.stringify({
                action: message,
            }),
        };

        try {
            await apigate.postToConnection(params).promise();
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}



module.exports = {
    getSocketConnections,
    sendSocketMessage
}