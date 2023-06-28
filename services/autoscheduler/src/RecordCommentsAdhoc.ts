import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { captureCommentVideoV2Task } from './helpers/submitRecordingsRequest'

module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const {
        username,
        timeout,
        jobId,
        callbackurl=""
    }:{ jobId:string, username:string, timeout:string , callbackurl:string} = JSON.parse(event.body || '{}');

    //error checking username
    if(username == ""){
        return {
            statusCode:400,
            body: JSON.stringify({
                msg:"username is empty"
            })
        }
    }

    //error checking timeout
    if(timeout == ""){
        return {
            statusCode:400,
            body: JSON.stringify({
                msg:"timeout is empty"
            })
        }
    }

    //error checking jobId
    if(jobId == ""){
        return {
            statusCode:400,
            body: JSON.stringify({
                msg:"jobId is empty"
            })
        }
    }

    


    var commentVideoRequest = await captureCommentVideoV2Task({
        jobId: jobId,
        username:username,
        timeout:timeout,
        callbackurl:callbackurl
    })
    
    return {
        statusCode:200,
        body: JSON.stringify({
            msg:"record comment adhoc",
            data:commentVideoRequest
        })
    }
}