
import * as aws from 'aws-sdk';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { addYoutuberOrTwitchToAccount } from './helpers/db'
import axios from 'axios';
const dynamoDb = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T
});

const moment = require('moment');
module.exports.handler = async (event:APIGatewayEvent, context:any, callback:any):Promise<APIGatewayProxyResult> => {
    //username from body
    const { username, type } = JSON.parse(event.body || "");
    //username from query string

    if (typeof username !== 'string' || !username) {
        console.error('Validation Failed');
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
            'Access-Control-Allow-Headers': 'Content-Type'},
            body: 'Couldn\'t add the youtuber username..',
        }
    }

    if (typeof type !== 'string' || !type) {
        console.error('Validation Failed');
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
            body: 'Couldn\'t add the youtuber username..',
        }
    }

    try{

    const user = await axios.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me",{
        headers:{
            'Authorization': event.headers.Authorization,
        }
    })

    const {id,email}:{id:string,email:string} = user.data.user;

    await addYoutuberOrTwitchToAccount(username, id);
    
    const params:any = {
        TableName: process.env.YOUTUBERS_TO_CHECK_TABLE,
        Item: {
            youtubeusername: username,
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
            type,
            priority: 0
        },
    };
    await dynamoDb.put(params).promise();

    const cur:any = {
        youtubeusername: username,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
        type,
        priority: 0
    }

    const params2 = {
        MessageBody: JSON.stringify(cur),
        QueueUrl: process.env.YOUTUBERS_TO_CHECK_QUEUEUrl || "https://sqs.us-east-1.amazonaws.com/574134043875/YoutubersToCheckQueue"
    };

    const c = await sqs.sendMessage(params2).promise();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({
            params: params,
        }),
    }
}catch(err){
    console.log(err);
    return {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({
            error: err,
        }),
    }
}

}