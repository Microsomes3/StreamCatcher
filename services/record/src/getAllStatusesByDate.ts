import * as aws from "aws-sdk";
import { APIGatewayProxyResult } from 'aws-lambda'


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1", 
});

function getAllStatusesByDate(date:string){
    return new Promise(async (resolve,reject)=>{

        const params = {
            TableName: process.env.RecordStatusesTable || "RecordStatuses",
            IndexName: "friendly-date-index",
            KeyConditionExpression: "friendlyDate = :date",
            ExpressionAttributeValues: {
                ":date": date,
            },
        };
    
        const data = await documentClient.query(params).promise();

        resolve(data);

    })
}


module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> => {
    const date = event.pathParameters.date;

    const statuses:any = await getAllStatusesByDate(date);

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            date: date,
            results: statuses.Items || [],
        }),
    };
};