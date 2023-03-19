const aws = require('aws-sdk');


const documentClient = new aws.DynamoDB.DocumentClient(
    {
        region: process.env.AWS_REGION_T,
    }
);

module.exports.handler = async (event) => {

    const recordId = event.pathParameters.id;

    const params = {
        TableName: process.env.RECORD_TABLE,
        Key: {
            id: recordId
        }
    };

    const data = await documentClient.get(params).promise();

    if (!data.Item) {
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

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(data.Item)
    }
};
