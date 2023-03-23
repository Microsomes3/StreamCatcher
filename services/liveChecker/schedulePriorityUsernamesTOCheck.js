const aws = require("aws-sdk");

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T
});


module.exports.handler = async(event)=>{

    const params = {
        TableName: process.env.YOUTUBERS_TO_CHECK_TABLE,
        IndexName: "priority-index",
        KeyConditionExpression: "priority = :priority",
        ExpressionAttributeValues: {
            ":priority": 1,
        },
    }

    const data = await documentWriter.query(params).promise();

    const usernames = data.Items.map((item) => {
        return item.youtubeusername;
    });

    const allMessageIds = [];

    for(var i = 0; i < usernames.length; i++){
        const params = {
            MessageBody: usernames[i],
            QueueUrl: process.env.YOUTUBERS_TO_CHECK_QUEUEUrl
        };

        const data = await sqs.sendMessage(params).promise();

        allMessageIds.push(data.MessageId);

    }


    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "OK",
            data:data,
            allMessageIds: allMessageIds
        }),
    }
}