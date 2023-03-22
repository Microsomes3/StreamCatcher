const aws = require('aws-sdk');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});


module.exports.handler = async (event) => {

    const requestId = event.pathParameters.id;

    //delete record request

    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE,
        Key: {
            id: requestId,
        },
    };

    const data = await documentClient.delete(params).promise();



    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            results: data.Items || [],
        }),
    };

}
