import { deleteAllScheduledTasks } from './helpers/databasehelperv2';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

module.exports.handler = async (event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult> => {
    await deleteAllScheduledTasks();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Success",
        }),
    }
}