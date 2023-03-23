const aws = require('aws-sdk');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1"
});


function getRecordRequest(id){
    return new Promise((resolve, reject) => {
        const params = {
            TableName: "RecordRequestTable",
            Key: {
                id: id
            }
        };
    
        documentClient.get(params, (err, data) => {
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
            TableName: "RecordStatuses",
            Key: {
                id: recordId
            }
        };
    
        const data = await documentClient.get(params).promise();
    
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


// const data = getRecordStatusByRecordId({recordId: "a4f1b8a6-256a-49ab-a8d3-739ae52bc41e"})
// .then(data => {
//     console.log(data);
// })


module.exports.handler = async (event) => {
    const id = event.pathParameters.id;

   const data = await getRecordStatusByRecordId({recordId: id});

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(data)
    }
};
