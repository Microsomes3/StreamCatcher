import * as aws from 'aws-sdk';
import moment from 'moment';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import axios from 'axios';

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


module.exports.handler = async (event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult> => {

    try{
    const user = await axios.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me",{
        headers:{
            'Authorization': event.headers.Authorization,
        }
    })

    const {id,email}:{id:string,email:string} = user.data.user;


    const {
        provider = "youtube",
        username,
        duration,
        trigger,
        isComments,
        shouldRecordStart,
        label, triggerTime, triggerInterval }:{
            provider:string,
            username:string,
            duration:number,
            trigger:any,
            isComments:boolean,
            shouldRecordStart:boolean,
            label:string,
            triggerTime:string,
            triggerInterval:string
        } = JSON.parse(event.body || "");

    if (!username || !duration || !trigger || !label || !triggerTime || !triggerInterval) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'Missing required parameters',
                expected: [

                ],
                gotten: Object.keys(event.body || {})
            }),
        };
    }

    //check of duration 
    if (isNaN(duration)) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be numbers',
            }),
        };
    }

    if (duration <= 0) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be positive numbers',
            }),
        };
    }

    //check if duration is a whole number

    if (duration % 1 !== 0) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be whole numbers',
            }),
        };
    }

    //check if duration is less than 24 hours (in seconds)

    if (duration > 86400) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'duration must be less than 24 hours',
            }),
        };
    }

 

    //isComment should be boolean
    if (typeof isComments !== 'boolean') {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'isComments must be a boolean',
            }),
        };
    }

    //check if shouldRecordStart is a boolean
    if (typeof shouldRecordStart !== 'boolean') {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'shouldRecordStart must be a boolean',
            }),
        };
    }

    var acceptedIntervals = [
        "5m",
        "20m",
        "30m",
        "1hr",
        "2hr",
        "3hr"
    ]

    if (!acceptedIntervals.includes(triggerInterval)) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            },
            body: JSON.stringify({
                error: 'triggerInterval must be one of the following: 5m, 20m, 30m, 1hr, 2hr, 3hr',
            }),
        };
    }

    const params:any = {
        TableName: process.env.RECORD_REQUEST_TABLE,
        Item: {
            id: uuidv4(),
            email:email,
            accountId: id,
            provider,
            username,
            duration,
            trigger,
            maxparts:1,
            minruntime:5,
            createdAt: moment().unix(),
            friendlyCreatedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
            isComments,
            isRecordStart: shouldRecordStart,
            label,
            triggerTime,
            triggerInterval
        },
    };

    const data = await documentClient.put(params).promise();

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
        },
        body: JSON.stringify({
            input: params,
            data,
        }),
    };
}catch(err){
    return {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
        },
        body: JSON.stringify({
            error: err,
        }),
        
    }
}

}