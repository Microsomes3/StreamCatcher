import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createRecordRequestAdhoc, triggerRecordAdhoc } from './helpers/adhocHelper'


module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        
    return {
        statusCode: 200,
        body:JSON.stringify({
            msg:"Hello World"
        })
    }
}