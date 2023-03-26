const aws = require('aws-sdk');

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

function getRecordRequestById(id){
    return new Promise((resolve,reject)=>{
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            Key: {
                "id": id
            },
        }
        documentClient.get(params).promise().then((data)=>{
            resolve(data.Item);
        }).catch((err)=>{
            reject(err);
        })

    })
}

module.exports.handler = async (event) => {
    //request id from url
    const requestID = event.pathParameters.recordrequestid;

    try {
        const data = await getRecordRequestById(requestID);

        const params = {
            MessageBody: JSON.stringify({
                ...data
            }),
            QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL
        }

        const c = await sqs.sendMessage(params).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                c,
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