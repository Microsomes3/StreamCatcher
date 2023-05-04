import * as aws from 'aws-sdk';
import moment from 'moment';
import { getRecordRequestById } from './recordHelper';
import { AddToAutoSchedulerQueue, AddToAutoSchedulerRequest } from '../types/Common';

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1'
});

export enum AllowedPlatforms {
    Twitch = "twitch",
    YouTube = "youtube",
}

function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);
    });
}

export const createRecordRequestAdhoc = async (accountId:string,email:string,channelName:string, platform: AllowedPlatforms, duration: number): Promise<string> => {
    return new Promise(async (resolve,reject)=>{
        const reqid:string= uuidv4();
        const params:any = {
            TableName:  process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
            Item: {
                id: reqid,
                accountId: accountId,
                email: email,
                duration: duration,
                friendlyCreatedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
                isComments:false,
                isRecordStart:false,
                label:"adhoc_generated"+reqid,
                maxparts:1,
                minruntime:5,
                provider:platform,
                trigger:"adhoc_generated",
                triggerInterval:"n/a",
                triggerTime:"n/a",
                username:channelName,
            }

                
        }
        try{
            await documentClient.put(params).promise();
            resolve(reqid);
        }catch(err){
            console.log(err);
            reject(err);
        }
    })
}

export const triggerRecordAdhoc = async (reqid:string):Promise<boolean> => {
    return new Promise(async (resolve,reject)=>{
        try{
        const request = await getRecordRequestById(reqid);

        const ToAddMessage:AddToAutoSchedulerRequest = {
            request,
            auto:false
        }

        const params:AddToAutoSchedulerQueue = {
            MessageBody: JSON.stringify(ToAddMessage),
            QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/griffin-autoscheduler-service-dev-AutoScheduleQueue"
        }

        await new aws.SQS({
            region: process.env.AWS_REGION_T || 'us-east-1',
        }).sendMessage(params).promise();

        resolve(true);
    }catch(err){
        console.log(err);
        resolve(false);
    }

    })
}
