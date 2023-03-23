//responsible for receiving the progress of the recording and updating the database


const aws = require('aws-sdk');

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});


function getRecordRequest(id){
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUESTS_TABLE || "RecordRequestTable",
            Key: {
                id: id
            }
        };
    
        documentWriter.get(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Item || {});
            }
        });
    }
    )
}

function getRecordStatusByRecordId({recordId}){
    return new Promise(async (resolve,reject)=>{
        const params = {
            TableName: process.env.RecordStatusesTable || "RecordStatuses",
            Key: {
                id: recordId
            }
        };
    
        const data = await documentWriter.get(params).promise();
    
        if (!data.Item) {
            return {
                statusCode: 404,
                headers:{
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({
                    error: "Record not found!"
                }),
            }
        }
    
        const request = await getRecordRequest(data.Item.recordrequestid);
        
        const duration = parseInt(request.duration);
        const parts = parseInt(request.maxparts);
        const expectedRuntime = duration * parts;

        data.Item.recordrequest = request;

        const currentTime = parseInt(data.Item.progressState.totalTime)

        const parcentageComplete = (currentTime / expectedRuntime) * 100;

        //if the parcentage is greater than 100, set it to 100
        data.Item.parcentageComplete = parcentageComplete > 100 ? 100 : parcentageComplete;


        resolve(data.Item);
    })
}


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
        parcentage: 0
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


    try{

    const currentData = await getRecordStatusByRecordId({recordId: id});
    
    const newProgressState2 = {
        totalParts: totalPartsRecorded,
        storageUsed: storageUsed,
        totalTime: totalTimeSoFar,
        currentRecordedRunTime: currentRuntime,
        parcentage: currentData.parcentageComplete
    }

    const params2 = {
        TableName: process.env.RecordStatusesTable,
        Key: {
            id: id,
        },
        UpdateExpression: "set progressState = :p",
        ExpressionAttributeValues: {
            ":p": newProgressState2,
        },
    };

    await documentWriter.update(params2).promise();
}catch(e){
    console.log(e);
}

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