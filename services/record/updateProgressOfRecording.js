//responsible for receiving the progress of the recording and updating the database


const aws = require('aws-sdk');


module.exports.handler = async (event) => {
    const { currentRuntime, totalPartsRecorded, storageUsed, totalTimeSoFar } = JSON.parse(event.body);


    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            message: "OK",
            currentRuntime,
            totalPartsRecorded,
            storageUsed,
            totalTimeSoFar,
        }),
    }
}