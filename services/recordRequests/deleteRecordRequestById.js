const aws = require('aws-sdk');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});


module.exports.handler = async (event) => {

    const requestId = event.pathParameters.id;


    if(requestId == "9a16c253-d8d1-4f8f-9a62-5add6cdce7dd"){
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: "cannot delete griffin"
            }),
        }
    }

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
