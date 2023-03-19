const aws = require('aws-sdk');


const documentClient = new aws.DynamoDB.DocumentClient(
    {
        region: process.env.AWS_REGION_T,
    }
);


module.exports.handler = async (event) => {

    const requestId = event.pathParameters.requestId;

    const params = {
        TableName: process.env.RECORD_TABLE,
        IndexName: "record-request-id-index",
        KeyConditionExpression: "recordrequestid = :requestId",
        ExpressionAttributeValues: {
            ":requestId": requestId,
        },
    };

    const data = await documentClient.query(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            results: data.Items || [],
        }),
    };

}