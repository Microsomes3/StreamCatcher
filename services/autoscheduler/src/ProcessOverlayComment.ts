import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { overlayCommentTask } from './helpers/submitRecordingsRequest';

module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const {
        video,
        comment,
    }:{video:string, comment:string} = JSON.parse(event.body || '{}');


    const vi = await overlayCommentTask({
        video: video,
        comment: comment,
    })

    return {
        statusCode:200,
        body: JSON.stringify({
            msg:"record comment adhoc",
            vi
        })
    }

}