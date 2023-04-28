"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const sqs = new aws_sdk_1.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
const documentClient = new aws_sdk_1.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
function getRecordRequestById(id) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            Key: {
                "id": id
            },
        };
        documentClient.get(params).promise().then((data) => {
            resolve(data.Item);
        }).catch((err) => {
            reject(err);
        });
    });
}
module.exports.handler = async (event) => {
    try {
        const { recordrequestid } = event.pathParameters;
        const request = await getRecordRequestById(recordrequestid);
        const ToAddMessage = {
            request,
            auto: false
        };
        const params = {
            MessageBody: JSON.stringify(ToAddMessage),
            QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL || ""
        };
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
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: err,
            }),
        };
    }
};
