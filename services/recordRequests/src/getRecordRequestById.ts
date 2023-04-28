import * as aws from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'



const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});

module.exports.handler = async (event:APIGatewayProxyEvent) => {

    const id = event.pathParameters?.id;

    const params:any = {
        TableName: process.env.RECORD_REQUEST_TABLE,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "id",
        },
        ExpressionAttributeValues: {
            ":id": id,
        },
    };

    const data = await documentClient.query(params).promise();

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            results: data.Items
        }),
    };

}
