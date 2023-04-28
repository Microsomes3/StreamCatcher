
import { APIGatewayProxyResult } from 'aws-lambda';
import {
    getRecordEventByRecordId
} from './helpers/recordHelper'


module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> => {

    const id = event.pathParameters.id;

    const events= await getRecordEventByRecordId({id:id})

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: id,
            events:events
        }),
    }
}