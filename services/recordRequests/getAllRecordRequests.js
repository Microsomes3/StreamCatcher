const aws = require('aws-sdk');



module.exports.handler = async (event) => {
    const documentClient = new aws.DynamoDB.DocumentClient({
        region: process.env.AWS_REGION_T,
    });

    const params = {
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