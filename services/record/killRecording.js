const aws = require('aws-sdk');


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});

module.exports.handler = async (event) => {
    const id = event.pathParameters.id;

    //update status 
    const params = {
        TableName: process.env.RecordStatusesTable,
        Key: {
            id: id,
        },
        UpdateExpression: "set #status = :s",
        ExpressionAttributeNames:{
            "#status": "status",
        },
        ExpressionAttributeValues: {
            ":s": "KILLED",
        },
    };

    await documentClient.update(params).promise();

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            message: "Killed",
            params,
        }),

    };

}