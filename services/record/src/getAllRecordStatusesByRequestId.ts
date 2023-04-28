import * as aws from "aws-sdk";
import { APIGatewayProxyResult } from 'aws-lambda'
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});


module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> => {
    const requestId= event.pathParameters.requestId;

    const params:any = {
        TableName: process.env.RecordStatusesTable,
        IndexName: "record-request-id-index",
        KeyConditionExpression: "recordrequestid = :requestId",
        ExpressionAttributeValues: {
            ":requestId": requestId,
        },
    };

    const data = await documentClient.query(params).promise();

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            results: data.Items || [],
        }),
    };
};
    