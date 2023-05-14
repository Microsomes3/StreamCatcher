import * as aws from 'aws-sdk';
import moment from 'moment';
import axios from 'axios';

import { sendShitpostLink } from './discordHelper'

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

export function AddMuxingRequestToQueue({
    jobId,
    reqId,
    videoLink,
    audioLink
}:{jobId:string,reqId:string,videoLink:string,audioLink:string}) {
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

export function addRecordEvent({
    Job,
    Status,
    Recordid,
}:{Job:any,Status:string,Recordid:string}):Promise<any> {
    return new Promise((resolve,reject)=>{
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
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    })

}

export function updateRecordStatus({
    jobId,
    reqId,
    result,
    state,
    channelName
}:{jobId:string, reqId:string,result:any, state:any,channelName:string}) {
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

export function updateRecordStatuses({
    jobId,
    state,
}:{ jobId:string, state:string}) {
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

export function sendRecordingToShitpost({
    url
}:{url:Array<string>}):Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await sendShitpostLink(`- ${url}`);
            resolve(true)
        } catch (err) {
           resolve(false);
        }
    })
}

export function getRecordRequestById({ id }:{id:string}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
            Key: {
                id: id
            }
        }
        try {
            const c = await documentClient.get(params).promise();
            resolve(c);
        } catch (err) {
            reject(err);
        }
    })
}

export function sendRecordDataTOApi({ data }:{data:any}) {
    return new Promise(async (resolve, reject) => {
        //use axios and timeout is 10 seconds
        try {
            const c = await axios.post("https://streamcatcher.herokuapp.com/tracker/callbackRecordStatus", data, {
                timeout: 10000
            });
            resolve(c);
        } catch (err) {
            reject(err);
        }
    })
}

export function getRecordEventByRecordId({ id }:{id:string}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_EVENT_TABLE || "RecordEventTable",
            IndexName: "record-id-index",
            KeyConditionExpression: "recordid = :id",
            ExpressionAttributeValues: {
                ":id": id
            },
        }
        try {
            const c = await documentClient.query(params).promise();
            resolve(c);
        } catch (err) {
            reject(err);
        }
    })
}

export function scheduleMuxJobECS({
    jobId,
    reqId,
    videoLink,
    audioLink}:{jobId:string, reqId:string, videoLink:string, audioLink:string}){
        return new Promise((resolve,reject)=>{

            const params:any = {
                MessageBody: JSON.stringify({
                    jobId: jobId,
                    reqId: reqId,
                    videoLink: videoLink,
                    audioLink: audioLink,
                }),
                QueueUrl: process.env.MUXING_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/MuxingQueue"
            }

            sqs.sendMessage(params, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })

        })
    }


    console.log("Loaded DB");

    scheduleMuxJobECS({
        jobId: "6f00e51c-03df-48da-94d6-ce4e82892408",
        reqId: "e3d035ac-fbe2-49e3-812e-327c6fb5f342",
        videoLink: "https://d213lwr54yo0m8.cloudfront.net/0_847cea34-6d09-4adb-9700-6cdae6b5c469.mp4",
        audioLink: "https://d213lwr54yo0m8.cloudfront.net/1_847cea34-6d09-4adb-9700-6cdae6b5c469.mp4"
    }).then((d)=>{
        console.log(d);
    })