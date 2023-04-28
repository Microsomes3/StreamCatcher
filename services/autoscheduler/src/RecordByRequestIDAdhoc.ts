import { SQS, DynamoDB } from 'aws-sdk';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda'
import { AddToAutoSchedulerQueue, AddToAutoSchedulerRequest } from './types/Common'

const sqs = new SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

const documentClient = new DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

function getRecordRequestById(id:number) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            Key: {
                "id": id
            },
        }
        documentClient.get(params).promise().then((data) => {
            resolve(data.Item);
        }).catch((err) => {
            reject(err);
        })

    })
}

module.exports.handler = async (event: any): Promise<APIGatewayProxyResult> => {
    try {
        const {recordrequestid} = event.pathParameters

        const request = await getRecordRequestById(recordrequestid);

        const ToAddMessage:AddToAutoSchedulerRequest = {
            request,
            auto:false
        }

        const params:AddToAutoSchedulerQueue = {
            MessageBody: JSON.stringify(ToAddMessage),
            QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL || ""
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
                error: err,
            }),
        }
    }
};