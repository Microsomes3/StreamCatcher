const aws = require("aws-sdk");


const documentReader = new aws.DynamoDB.DocumentClient({
    region:process.env.AWS_REGION_T
});


module.exports.getLiveStatusByUsername = async (event) => {

    const username =  event.pathParameters.username;

    const params = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE,
        Key:{
            "youtubeusername": username
        }
    };

    const data = await documentReader.get(params).promise();

    if(!data.Item){
        return {
            statusCode:200,
            body:JSON.stringify({
                username: username,
                status:false,
            }),
        }
    }

    const isLive = data.Item.isLive;

    return {
        statusCode:200,
        body:JSON.stringify({
            username: username,
            status:isLive,
            link: data.Item.liveLink
        }),
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        }
   
    }



};