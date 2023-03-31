const aws = require('aws-sdk');
const apigate = new aws.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: 'https://7hivo8j534.execute-api.us-east-1.amazonaws.com/dev',
    region: process.env.AWS_REGION_T || 'us-east-1',
});


const connectionid = "CmGnFf-goAMCEbA="

const params = {
    ConnectionId: connectionid,
    Data: JSON.stringify({
        action: "stop"
    })
}

apigate.postToConnection(params, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
})