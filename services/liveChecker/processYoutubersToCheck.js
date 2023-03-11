const aws = require("aws-sdk");
const moment = require("moment");

const { checkLIVE } = require('./helpers/checkLive');

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports.processYoutubersToCheck = async (event) => {

    const username = event.Records[0].body;

    // const username = "@GriffinGaming";

    const liveStatus = await checkLIVE(username);

    const params = {
        TableName: process.env.LIVE_CHECKER_TABLE,
        Item: {
            id: uuidv4(),
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
            channel: username,
            status: JSON.stringify(liveStatus),
            isLive: liveStatus.isLive,
        },
    };

    await documentWriter.put(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            liveStatus: liveStatus,
        }),

    }
}





