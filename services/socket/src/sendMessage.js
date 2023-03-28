const aws = require('aws-sdk');



const dynamo = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
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

        const result = await dynamo.scan(params).promise();

        const connections = result.Items.filter((item) => {
            return item.recordid === recordID;
        })

        resolve(connections[0] || null);



    });
}



module.exports.handler = async (event) => {
    
    return {
        statusCode: 200,
        body: {
            msg: "ll",
        }
    }

    const msg = JSON.parse(event.body);

    console.log(event);

    return {
        statusCode: 200,
        body: {
            recordID: recordID,
            msg: "ll",
        }
    }
    
    const action = JSON.parse(event.body);

    //check if action is kill or stop
    
    
        

}
    