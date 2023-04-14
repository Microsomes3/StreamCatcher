const aws = require('aws-sdk');
const moment = require("moment");

const { sendShitpostLink } = require('./discordHelper')

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1",
})

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || "us-east-1",
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function AddMuxingRequestToQueue({
    jobId,
    reqId,
    videoLink,
    audioLink
}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            QueueUrl: process.env.MUXING_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/MuxingQueue",
            MessageBody: JSON.stringify({
                jobId,
                reqId,
                videoLink: videoLink,
                audioLink: audioLink
            })
        }
        try {
            const lt = await sqs.sendMessage(params).promise();
            resolve(lt);
        }
        catch (e) {
            reject(e);
        }

    })
}

function addRecordEvent({
    Job,
    Status,
    Recordid
}) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_EVENT_TABLE || "RecordEventTable",
            Item: {
                id: uuidv4(),
                recordid: Recordid,
                date: moment().format("YYYY-MM-DD"),
                job: Job,
                status: Status,
                createdAt: new Date().getTime(),
            },
        }

        try {
            documentClient.put(params).promise();
            resolve();
        } catch (err) {
            reject(err);
        }
    })
}

function updateRecordStatus({
    jobId,
    reqId,
    result,
    state,
    channelName
}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_TABLE || "RecordTable",
            Item: {
                id: jobId,
                recordrequestid: reqId,
                date: moment().format("YYYY-MM-DD"),
                keys: result,
                status: state,
                username: channelName,
                createdAt: new Date().getTime(),
                friendlyName: "--"
            },
        };
        try {
            const c = await documentClient.put(params).promise();
            resolve(c);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    })
}

function updateRecordStatuses({
    jobId,
    state,
}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RecordStatusesTable || "RecordStatuses",
            Key: {
                id: jobId
            },
            UpdateExpression: "set #status = :s, #date = :d",
            ExpressionAttributeNames: {
                "#status": "status",
                "#date": "timeended" // add this line
            },
            ExpressionAttributeValues: {
                ":s": state,
                ":d": moment().unix() // add this line to set the date value to the current time in ISO format
            }
        };

        try {
            var c = await documentClient.update(params).promise();
            resolve(c);
        } catch (err) {
            reject(err);
        }
    })
}

function sendRecordingToShitpost({
    url
}){
    return new Promise(async (resolve,reject)=>{
        try{
            await sendShitpostLink(`- ${url}`);
            resolve()
        }catch(err){
            reject(err);
        }
    })
}

function getRecordRequestById({id}){
    return new Promise(async (resolve,reject)=>{
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
            Key: {
                id: id
            }
        }
        try{
            const c = await documentClient.get(params).promise();
            resolve(c);
        }catch(err){
            reject(err);
        }
    })
}

function getRecordEventByRecordId({id}){
    return new Promise(async (resolve,reject)=>{
        const params = {
            TableName: process.env.RECORD_EVENT_TABLE || "RecordEventTable",
            IndexName: "record-id-index",
            KeyConditionExpression: "recordid = :id",
            ExpressionAttributeValues: {
                ":id": id
            },
        }
        try{
            const c = await documentClient.query(params).promise();
            resolve(c);
        }catch(err){
            reject(err);
        }
    })
}

module.exports = {
    addRecordEvent,
    updateRecordStatus,
    updateRecordStatuses,
    AddMuxingRequestToQueue,
    sendRecordingToShitpost,
    getRecordRequestById,
    getRecordEventByRecordId
}