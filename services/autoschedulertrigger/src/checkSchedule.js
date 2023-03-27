
const { getAllRecordRequestsToSchedule } = require('./helpers/checkScheduleStandalone');
const { markAsRecording } = require('./helpers/recordHelper');
const moment = require('moment');

const aws = require('aws-sdk');

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

function getRecordRequestById(id){
    return new Promise(async (resolve,reject)=>{
        try{

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
                Key: {
                    id
                }
            }
            const results = await documentClient.get(params).promise();
            resolve(results.Item || {});

        }catch(e){
            console.log(e);
            reject({});
        }

    })
}


function handleFunc(){
    return new Promise(async (resolve,reject)=>{

        const recordRequests = await getAllRecordRequestsToSchedule();


        console.log("total record requests to trigger", recordRequests.length);

        var flattenRecordRequests = recordRequests.flat(1);
    
        var messageIds = [];
        var allResponses = [];
    
        for(let i=0; i<flattenRecordRequests.length; i++){
           
            const params = {
                TableName: process.env.AUTO_SCHEDULE_TABLEV2,
                Item: {
                    "recordrequestid": flattenRecordRequests[i].id,
                    "date": moment().format('YYYY-MM-DD'),
                    "time": moment().format('HH:mm:ss'),
                    "hour": moment().format('HH'),
                    "minute": moment().format('mm')
                }
            };
            
            const l = await documentClient.put(params).promise();
    
             const param = {
                MessageBody: JSON.stringify({
                    ...flattenRecordRequests[i]
                }),
                QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL,
            }
    
            const c = await sqs.sendMessage(param).promise();
            messageIds.push(c.MessageId);
           
            allResponses.push(l);

            resolve({
                messageIds,
                flattenRecordRequests,
                allResponses
            })
    
        }

    })
}




module.exports.handler = async (event) => {

    try{
    const { messageIds,flattenRecordRequests, allResponses  } = await handleFunc();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            live: messageIds,
            recordRequests: flattenRecordRequests,
            allResponses: allResponses
        }),
    };
}catch(e){
    console.log(e);
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: e
        }),
    };
}
};