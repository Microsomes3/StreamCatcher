import * as aws from 'aws-sdk';
import { AddToYoutubeToAccountParams } from './types'

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1",
});


export const addYoutuberOrTwitchToAccount=(name:string, accountId:string):Promise<any>=>{ 
    return new Promise(async (resolve,reject)=>{
        const params:AddToYoutubeToAccountParams = {
            TableName: process.env.YOUTUBE_TO_ACCOUNT || "griffin-livechecker-service-dev-YoutubersToAccount-1P90FHFY1WGL9", 
            Item: {
                ytusernameaccountid: name,
                accountId: accountId
            },
        }

        try {
            await documentWriter.put(params).promise();
            resolve(true);
        }catch(e){
            resolve(false);
        }
    })
}

export const getAllChannelsForAccount=(accountId:string):Promise<any>=>{
    return new Promise(async (resolve,reject)=>{
        const params = {
            TableName: process.env.YOUTUBE_TO_ACCOUNT || "griffin-livechecker-service-dev-YoutubersToAccount-1P90FHFY1WGL9",
            IndexName: "accountId-index",
            KeyConditionExpression: "accountId = :accountId",
            ExpressionAttributeValues: {
                ":accountId": accountId
            }
        };

        try {
            const res = await documentWriter.query(params).promise();
            resolve(res.Items);
        }catch(e){
            resolve([]);
        }
        

    })
}

export const getAggregateChannel= (channelName:string):Promise<any>=>{
    return new Promise(async (resolve,reject)=>{
        const params:any = {
            TableName: "AggregateCurrentYoutuberLive",
            KeyConditionExpression: "youtubeusername = :youtubeusername",
            ExpressionAttributeValues: {
                ":youtubeusername": channelName
            }
        }

        const d = await documentWriter.query(params).promise();

        if(d.Items){
            resolve(d.Items[0])
        }else{
            resolve([]);
        }

    })
}



