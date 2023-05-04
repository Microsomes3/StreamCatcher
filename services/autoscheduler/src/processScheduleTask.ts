import * as aws from 'aws-sdk'
import { makeRecordRequest } from './helpers/submitRecordingsRequest'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});




function handleFunc(request:any, auto:any) {
    return new Promise(async (resolve, reject) => {

        console.log(request);

        const c = await makeRecordRequest(
            request.id,
            auto,
            request.provider || 'youtube',
        );
        resolve(c);

    })
}

module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> => {

    //queue message
    const { request, auto } = JSON.parse(event.Records[0].body);

    const status = await handleFunc(request, auto);


    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
            liveStatus: status,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    }
};