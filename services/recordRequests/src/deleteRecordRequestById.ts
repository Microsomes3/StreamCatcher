import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import axios from 'axios';
import { deleteRecordRequestById } from './helpers/rdrequestsHelper'

module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {
        const user = await axios.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me", {
            headers: {
                'Authorization': event.headers.Authorization,
            }
        })

        const { id: userid }: { id: string, email: string } = user.data.user;

        const requestId: string = event.pathParameters?.id || "";

        const deleteResult: boolean = await deleteRecordRequestById(requestId, userid)

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                result: deleteResult,
            })
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: err,
            }),
        };
    }
}
