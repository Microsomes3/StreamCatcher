//responsible for receiving the progress of the recording and updating the database


const aws = require('aws-sdk');

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});


module.exports.handler = async (event) => {
    const id = event.pathParameters.id;
    const { currentRuntime, totalPartsRecorded, storageUsed, totalTimeSoFar } = JSON.parse(event.body);

    if (!currentRuntime || !totalPartsRecorded || !storageUsed || !totalTimeSoFar) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                message: "Missing parameters",
            }),
        }
    }

    const newProgressState = {
        totalParts: totalPartsRecorded,
        storageUsed: storageUsed,
        totalTime: totalTimeSoFar,
        currentRecordedRunTime: currentRuntime,
    }

    const params = {
        TableName: process.env.RecordStatusesTable,
        Key: {
            id: id,
        },
        UpdateExpression: "set progressState = :p",
        ExpressionAttributeValues: {
            ":p": newProgressState,
        },
    };

    await documentWriter.update(params).promise();


    //TODO- check if record is has a kill signal, if so, kill the recording

    var isKillSignal = false;

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            message:  isKillSignal ? "Kill" : "Updated",
            params,
            currentRuntime,
            totalPartsRecorded,
            storageUsed,
            totalTimeSoFar,
        }),
    }
}