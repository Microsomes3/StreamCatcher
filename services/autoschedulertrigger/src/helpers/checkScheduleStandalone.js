const aws = require('aws-sdk');

const { processRecordings } = require('./recordHelper')

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

function getAllRecordRequestsByUsername(username){
    return new Promise((resolve,reject)=>{

        try{

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
                IndexName: process.env.RECORD_RECORD_USERNAME_INDEX || "username-index",
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


function checkScheduleC(){
    return new Promise(async (resolve,reject)=>{
        try{


    const params = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "AggregateCurrentYoutuberLive"
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
            requests: requests.Items || []
        })  
    }

    var allDs = [];


    for(let i=0; i<allData.length; i++){
        const username = allData[i].username;
        const livelink = allData[i].livelink;
        const requests = allData[i].requests;

        console.log(allData);


        console.log("checking for", username );
        console.log("requests to check", requests.length );

        const d = await processRecordings({
            username,
            livelink,
            requests
        });

        allDs.push(d);

    }

    resolve(allDs);


        }catch(err){
            reject(err);
        }
    })
}


module.exports = {
    checkScheduleC
}