const aws = require("aws-sdk");
const moment = require("moment");

const { getAllCallbacks } = require("./helpers/getAllCallbacks")


const documentReader = new aws.DynamoDB.DocumentClient({
    region:process.env.AWS_REGION_T
});


module.exports.getLiveStatusesFromDB = async (event) => {
    const params = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE,
    };

    const data = await documentReader.scan(params).promise();

    const items =  [];

    data.Items.forEach(item=>{
        items.push({
           islive: item.isLive,
           username: item.youtubeusername,
           lastUpdated: moment(item.updatedAt).fromNow(),
        })
    })

    for(let i = 0; i < items.length; i++){
        const callbacks = await getAllCallbacks(items[i].username);
        items[i].callbacks = callbacks;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            youtubers: items,
        }),
    }
}