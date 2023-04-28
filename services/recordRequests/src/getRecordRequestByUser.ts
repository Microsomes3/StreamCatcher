import { getAllRequestsFromUser } from './helpers/rdrequestsHelper'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

module.exports.handler = async (event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult> => {
  
    const username = event.pathParameters?.username;
    const data = await getAllRequestsFromUser(username || "");

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
}