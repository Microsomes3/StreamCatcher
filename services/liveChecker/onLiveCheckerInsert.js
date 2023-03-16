const aws = require("aws-sdk");

const moment = require('moment');

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

module.exports.onLiveCheckerInsert= async (event)=>{
    
    for (let record of event.Records) {

        try{
        const newImage = record.dynamodb.NewImage;
        const channel = newImage.channel.S;
        const isLive = newImage.isLive.BOOL;
        if(isLive){
            console.log("islive")
        }else{
            console.log("not islive")
        }

        console.log("channel", channel);


        const params = {
            TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE,
            Item: {
                youtubeusername: channel,
                isLive: isLive,
                updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                extra: newImage,
                liveLink: newImage.liveLink.S

            },
        };

        await documentWriter.put(params).promise();
    }catch(e){
        console.log(e);
    }

    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }),
    };
        
}