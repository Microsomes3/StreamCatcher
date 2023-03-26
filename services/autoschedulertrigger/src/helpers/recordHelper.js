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

function checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
    requestID,
    date
}){
    return new Promise((resolve,reject)=>{

        const params = {
            TableName: process.env.AUTO_RECORD_TABLE || 'RecordAutoRecordTable',
            IndexName: process.env.AUTO_RECORD_DATE_INDEX || 'date-index',
            KeyConditionExpression: "#d = :date",
            ExpressionAttributeNames: {
                "#d": "date"
            },
            ExpressionAttributeValues: {
                ":date": date
            }
        }

        const data = documentClient.query(params).promise();

        data.then((results)=>{
            const items = results.Items || [];
            const found = items.filter((item)=>{
                return item.recordrequestid == requestID;
            });

            if(found.length > 0){
                resolve(true);
                return;
            }

            resolve(false);
        }).catch((e)=>{
            console.log(e);
            resolve(false);
        })
    })
}

function checkWhichRequestsShouldTrigger({
    requests
}){
    return new Promise(async (resolve,reject)=>{

        var requestsToTrigger = [];

        for(var i=0; i<requests.length; i++){
            const request = requests[i];
           
            const exists = await checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
                requestID: request.id,
                date: moment().format('YYYY-MM-DD')
            });
            
            if(!exists){
                requestsToTrigger.push(request);
            }
            
        }

        resolve(requestsToTrigger);

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
    checkWhichRequestsShouldTrigger,
    markAsRecording
}