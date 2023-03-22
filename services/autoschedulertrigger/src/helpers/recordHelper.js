const aws = require('aws-sdk');

const { makeRecordRequest } = require('./submitRecordingsRequest')


const moment = require('moment');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});


function getAllAutoRecordsByCurrentDate(){
    return new Promise(async (resolve,reject)=>{
       
        const params = {
            TableName: process.env.AUTO_RECORD_TABLE || 'RecordAutoRecordTable',
            IndexName: process.env.AUTO_RECORD_DATE_INDEX || 'date-index',
            KeyConditionExpression: "#d = :date",
            ExpressionAttributeNames: {
              "#d": "date"
            },
            ExpressionAttributeValues: {
              ":date": moment().format('YYYY-MM-DD')
            }
          }
          

        const results = await documentClient.query(params).promise();

        resolve(results.Items || []);
    })
}

function processRecordings({
    username,
    livelink,
    requests
}){
    return new Promise(async (resolve,reject)=>{

        //todo- check if a video has been already recorded,via the auto record table
        // if so check the video status, see if it was successfull, otherwise launch again


        const allAutoRecordings =  await getAllAutoRecordsByCurrentDate();

        console.log("allAutoRecordings", allAutoRecordings);

        if(allAutoRecordings.length == 0) {
            //save to record since we have no recordings for today

            for(let i=0; i<requests.length; i++){
                const request = requests[i];
                await markAsRecording({
                    username,
                    livelink,
                    request
                });
            }

            resolve(true);
            return;
        }


        const allMyRecordings = allAutoRecordings.filter((recording)=>{
            return recording.username == username;
        });

        if(allMyRecordings.length == 0){
            //save to record since we have no recordings for today

            for(let i=0; i<requests.length; i++){
                const request = requests[i];
                await markAsRecording({
                    username,
                    livelink,
                    request
                });
            }

            resolve(true);
            return;
        }


        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];

            const myRecordingsForThisRequest = allMyRecordings.filter((recording)=>{
                return recording.request.id == request.id;
            });

            if(myRecordingsForThisRequest.length == 0){
                //save to record since we have no recordings for today
                try{
                await markAsRecording({
                    username,
                    livelink,
                    request
                });
            }catch(e){
                console.log("wait try later");
            }

            }
        }

        resolve(false);
    })
}



function markAsRecording({
    username,
    livelink,
    request
}){
    return new Promise(async (resolve,reject)=>{

        try{

        const record  = await makeRecordRequest({
           requestId:request.id,
        }); 

        const params = {
            TableName: process.env.AUTO_RECORD_TABLE || 'RecordAutoRecordTable',
            Item: {
                id: record.recordId,
                date: moment().format('YYYY-MM-DD'),
                username:username,
                livelink:livelink,
                request,
                recordrequestid:request.id,
                recordid: record.recordId,
                status:"pending"
            }
        }

        const result = await documentClient.put(params).promise();

        resolve(result);
    }catch(e){
        console.log(e);
        reject(e);
    }
    })
}



module.exports = {
    processRecordings,
    markAsRecording
}