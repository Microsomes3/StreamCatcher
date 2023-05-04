import {getRequestsByAccountIdAndChannel } from './helpers/rdrequestsHelper'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import axios from 'axios';

module.exports.handler = async (event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult> => {
  
    try{
    const user = await axios.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me",{
        headers:{
            'Authorization': event.headers.Authorization,
        }
    })

    const {id,email}:{id:string,email:string} = user.data.user;

    const username = event.pathParameters?.username;
    const data = await getRequestsByAccountIdAndChannel(id, username || "");

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            input: username,
            data,
        }),
    };
}catch(e){
    return {
        statusCode: 500,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            error: e,
        }),
    };
}
}