import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters} from 'aws-lambda'
import {deleteAutoV3ScheduleMarker} from './helpers/recordHelper';



module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> =>{

    var username = event.pathParameters.username;

    try{
        await deleteAutoV3ScheduleMarker({
            username
        })
    
    }catch(err){
        console.log("---error---")
        console.log(err)
    }

    return {
        statusCode:200,
        body:JSON.stringify({
            msg:"delete auto marker",
            event:event,
            username
        })
    }

    try{


   await deleteAutoV3ScheduleMarker({
        username
    })

   

    console.log(username);

    return {
        statusCode:200,
        body:JSON.stringify({
            msg:"delete auto marker",
            username:username,
        })
    }
    }catch(e){
        console.log(e);
        return {
            statusCode:500,
            body:JSON.stringify({
                msg:"error",
                error:e
            })
        }
    }

}