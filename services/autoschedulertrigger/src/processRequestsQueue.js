const { getAllRecordRequestsToSchedule } = require('./helpers/checkScheduleStandalone');

const aws = require('aws-sdk');

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

async function handleFunc(youtuber){
   return new Promise(async (resolve, reject) => {

    const requests =  await getAllRecordRequestsToSchedule({
        youtuber: youtuber
    });

    
    if(requests.length === 0){
        resolve(false);
    }else{

        const all = requests[0];

        if(all.length == 0){
            resolve(false);
            return;
        }

        for (let i = 0; i < all.length; i++) {
            const request = all[i];
            console.log(request);
            const params = {
                QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/griffin-autoscheduler-service-dev-AutoScheduleQueue",
                MessageBody: JSON.stringify({
                    request:request,
                    auto:true
                })
            }

            const c= await sqs.sendMessage(params).promise();
            console.log(c);
        }


        resolve(true);
    }

   })
}


module.exports.handler = async (event, context) => {
    //get message from queue
    const message = JSON.parse(event.Records[0].body);
    const youtuber = message.youtuber

   const status = await handleFunc(youtuber);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: status
        }),
    }
}

