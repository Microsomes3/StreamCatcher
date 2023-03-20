const aws = require('aws-sdk');

const { makeRecordRequest } = require('./helpers/submitRecordingRequest');


module.exports.handler = async (event) => {
    //request id from url
    const requestID = event.pathParameters.requestid;

    try {
        const data = await makeRecordRequest({
            requestId: requestID
        })

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                data,
                status: "PENDING_RECORD",
            }),
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: err.message,
            }),
        }
    }
};