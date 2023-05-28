import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createRecordRequestAdhoc, triggerRecordAdhoc } from './helpers/adhocHelper'

import { submitJobToEcsv2 } from './helpers/submitRecordingsRequest';


function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
}

module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const {
        channel,
        duration
    }:{channel:string, duration:Number} = JSON.parse(event.body || '{}')

    const recordId = uuidv4()

    const provider = channel[0] == '@' ? 'youtube' : 'twitch'

    const c =await submitJobToEcsv2(channel, "reqid", recordId, duration.toString(), false, provider, "no", "ytarchive");

        
    return {
        statusCode: 200,
        body:JSON.stringify({
            msg:"Hello World",
            c
        })
    }
}