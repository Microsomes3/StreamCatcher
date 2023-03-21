const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});


function getAllRecordRequestsByUsername(username){
    return new Promise((resolve,reject)=>{

        try{

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE,
                IndexName: process.env.RECORD_RECORD_USERNAME_INDEX,
                KeyConditionExpression: "username = :username",
                ExpressionAttributeValues: {
                    ":username": username
                }
            }

            const results = documentClient.query(params).promise();

            resolve(results);

        }catch(e){
            console.log(e);
            reject([]);
        }

    })
}

function seeIfWeNeedToRecord({
    username,
    livelink,
    requests
}){
    return new Promise((resolve,reject)=>{})
}


module.exports.handler = async (event) => {

    //scan all

    const params = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE,
    };

    const data = await documentClient.scan(params).promise();

    const liveYoutubers = data.Items;

    //filter islive

    const liveYoutubersFiltered = liveYoutubers.filter((youtuber) => {
        return youtuber.isLive === true;
    });

    const allData = [];
    
    for(let i=0; i<liveYoutubersFiltered.length; i++){
        const username = liveYoutubersFiltered[i].youtubeusername;
        const livelink = liveYoutubersFiltered[i].liveLink;
        const requests = await getAllRecordRequestsByUsername(username);

        allData.push({
            username,
            livelink,
            requests,
        })  
    }

    
    return {
        statusCode: 200,
        body: JSON.stringify({
            live: allData
        }),
    };
};