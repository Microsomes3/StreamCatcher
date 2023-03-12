const aws = require("aws-sdk");


const documentReader = new aws.DynamoDB.DocumentClient({
    region:process.env.AWS_REGION_T
});


module.exports.getLiveStatusesFromDB = async (event) => {
    const params = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE,
    };

    const data = await documentReader.scan(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            youtubers: data,
        }),
    }
}