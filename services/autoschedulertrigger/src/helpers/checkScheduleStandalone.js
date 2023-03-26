const aws = require('aws-sdk');

const { checkWhichRequestsShouldTrigger, markAsRecording } = require('./recordHelper')

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


function getAllRecordRequestsToSchedule(){
    return new Promise(async (resolve,reject)=>{
        try{


    const params = {
        TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "AggregateCurrentYoutuberLive"
    };

    const data = await documentClient.scan(params).promise();

    const liveYoutubers = data.Items;

    const liveYoutubersFiltered = liveYoutubers.filter((youtuber) => {
        return youtuber.isLive === true;
    });


    var allLiveUsernamesAndTheirRequests = [];
    
    for(let i=0; i<liveYoutubersFiltered.length; i++){
        const username = liveYoutubersFiltered[i].youtubeusername;
        const livelink = liveYoutubersFiltered[i].liveLink;
        const requests = await getAllRecordRequestsByUsername(username);

        allLiveUsernamesAndTheirRequests.push({
            username,
            livelink,
            requests: requests.Items || []
        })  
    }

    //filter and remove all usernames that do not have any record requests
    allLiveUsernamesAndTheirRequests = allLiveUsernamesAndTheirRequests.filter((d)=>{
        return d.requests.length > 0;
    })

    var allRecordRequestsToTrigger = [];

    for(let i=0; i<allLiveUsernamesAndTheirRequests.length; i++){
        const username = allLiveUsernamesAndTheirRequests[i].username;
        const livelink = allLiveUsernamesAndTheirRequests[i].livelink;
        const requests = allLiveUsernamesAndTheirRequests[i].requests;


        console.log("checking for", username );
        console.log("requests to check", requests.length );

        const requestsToTrigger = await checkWhichRequestsShouldTrigger({
            username,
            livelink,
            requests
        });

      
        allRecordRequestsToTrigger.push(requestsToTrigger);

    }

    console.log(allRecordRequestsToTrigger);


    resolve(allRecordRequestsToTrigger);


        }catch(err){
            reject([]);
        }
    })
}


module.exports = {
    getAllRecordRequestsToSchedule
}