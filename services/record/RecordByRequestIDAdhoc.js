const aws = require('aws-sdk');



module.exports.handler = async (event) => {
    //request id from url
    const requestID = event.pathParameters.requestid;
    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(requestID),
    }
};