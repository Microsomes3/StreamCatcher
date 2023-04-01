
const aws = require('aws-sdk');

const moment = require('moment');

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

function handleFunc() {
    return new Promise(async (resolve, reject) => {
        try{
        const params = {
            TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "AggregateCurrentYoutuberLive",
        }

        const data = await documentClient.scan(params).promise();

        var allYoutubersEligibleToCheck = [];
       
        for(let i = 0; i < data.Items.length; i++) {
            const lastUpdated = moment(data.Items[i].updatedAt);
            const currentTime = moment().subtract(1, 'hour');
            const diff = currentTime.diff(lastUpdated, 'minutes');
          
            if(diff <30 && data.Items[i].isLive === true){
                allYoutubersEligibleToCheck.push(data.Items[i]);
            }
            
        }
        
        for(let i = 0; i < allYoutubersEligibleToCheck.length; i++) {
            const params = {
                QueueUrl: process.env.CHECK_SCHEDULE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/griffin-autoscheduler-service-dev-CheckScheduleQueue",
                MessageBody: JSON.stringify({
                    youtuber: allYoutubersEligibleToCheck[i].youtubeusername
                })
            }

            await sqs.sendMessage(params).promise();
        }

        console.log("allYoutubersEligibleToCheck", allYoutubersEligibleToCheck.length);
        resolve();
    }catch(e){
        console.log(e);
        reject(e);
    }
    })
}



module.exports.handler = async (event) => {
    try {
        await handleFunc();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success",
            }),
        };
    } catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: e,
                currentTime: moment().format("YYYY-MM-DD HH:mm:ss")
            }),
        };
    }
};