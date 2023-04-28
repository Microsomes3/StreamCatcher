import * as aws from "aws-sdk";
import { APIGatewayProxyResult } from 'aws-lambda'

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});

function getRQ(username:string){
    return new Promise((resolve, reject) => {

        const params:any = {
            TableName: process.env.RECORD_REQUEST_TABLE,
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
        };

        const data = documentClient.query(params).promise();

        resolve(data);

    });
}

function getAllRecodingsByRequestId(requestId:string){
    return new Promise((resolve, reject) => {
        const params:any = {
            TableName: process.env.RECORD_TABLE,
            IndexName: "record-request-id-index",
            KeyConditionExpression: "recordrequestid = :recordRequestId",
            ExpressionAttributeValues: {
                ":recordRequestId": requestId,
            },
        };

        const data = documentClient.query(params).promise();

        resolve(data);
    })
}



module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> => {

    const username = event.pathParameters.username;

    const data:any = await getRQ(username);

    if (!data.Items) {
        return {
            statusCode: 404,
            headers:{
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: "Record not found!"
            }),
        }
    }

    var allData = [];


    for(var i = 0; i < data.Items.length; i++){
        const recordRequestId = data.Items[i].id;
        const recordData:any = await getAllRecodingsByRequestId(recordRequestId);
        allData.push({
            recordRequestId: recordRequestId,
            recordData: recordData.Items,
            requestData: data.Items[i]
        });
    }

    var allRecordings = [];


    for(var i = 0; i < allData.length; i++){
        for(var j = 0; j < allData[i].recordData.length; j++){
            allRecordings.push(allData[i].recordData[j]);
        }
    }



    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            results: allRecordings || [],
            allData: allData
        })
    }

}