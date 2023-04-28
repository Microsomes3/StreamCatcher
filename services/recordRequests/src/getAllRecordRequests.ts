import * as aws from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'


module.exports.handler = async (event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult> => {
    const documentClient = new aws.DynamoDB.DocumentClient({
        region: process.env.AWS_REGION_T,
    });

    const params:any = {
        TableName: process.env.RECORD_REQUEST_TABLE,
    };

    const data = await documentClient.scan(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            input: params,
            data,
        }),
    };

}