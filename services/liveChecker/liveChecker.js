const aws = require("aws-sdk");
const moment = require("moment");
const chromium = require('chrome-aws-lambda');
const { checkLIVE } = require("./helpers/checkLive")


const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// const id = uuidv4();

// const params = {
//     TableName: process.env.LIVE_CHECKER_TABLE,
//     Item: {
//         id: id,
//         createdAt: moment().unix(),
//         updatedAt: moment().unix(),
//         channel:"test",
//         status: "live",
//     },
// };

// await documentWriter.put(params).promise();

module.exports.getLiveStatus = async (event,context,callback) => {
    
    const username = "@GriffinGaming";

    const data = await checkLIVE(username);

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data,
            username: username,
        }),
    }
};