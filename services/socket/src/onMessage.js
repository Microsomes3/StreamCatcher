const aws = require('aws-sdk');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});



module.exports.handler = async (event) => {
    //onconnect event
    const connectionId = event.requestContext.connectionId;

    //handle ping
    if(event.body === 'ping'){
        return {
            statusCode: 200,
            body: 'pong',
        };
    }

    const {action}=JSON.parse(event.body)

    switch(action){
        case "registerreceiver":
            const {recordid}=JSON.parse(event.body)
            const params = {
                TableName: process.env.SOCKET_CONNECTIONS_TABLE,
                Item: {
                    connectionId: connectionId,
                    createdAt: Date.now(),
                    status: 'connected',
                    recordid: recordid,
                },
            };

            const result = await documentClient.put(params).promise();
            break;
    }



    console.log(connectionId)
    // const params = {
    //     TableName: process.env.SOCKET_CONNECTIONS_TABLE,
    //     Item: {
    //         connectionId: connectionId,
    //         createdAt: Date.now(),
    //         status: 'connected',
    //         message: message,
    //     },
    // };

    // const result = await documentClient.put(params).promise();

    return {
        statusCode: 200,
        body: 'Connected',
    };

}