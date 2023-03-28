const aws = require('aws-sdk');

const { makeRecordRequest } = require('./submitRecordingsRequest')


const moment = require('moment');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});


function getAllAutoRecordsByCurrentDate() {
    return new Promise(async (resolve, reject) => {

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


function getRecordRequestById(id) {
    return new Promise(async (resolve, reject) => {
        try {

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
                Key: {
                    id
                }
            }

            const results = await documentClient.get(params).promise();

            resolve(results.Item || {});

        } catch (e) {
            console.log(e);
            reject({});
        }

    })
}

function checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
    requestID,
    date,
}) {
    return new Promise(async (resolve, reject) => {

        const requestDetails = await getRecordRequestById(requestID);

        const params = {
            TableName: process.env.AUTO_SCHEDULE_TABLEV2 || 'griffin-autoscheduler-service-dev-AutoScheduleV2Table-1OQJML172K83Y',
            KeyConditionExpression: 'recordrequestid = :id and #date = :date',
            ExpressionAttributeNames: {
                '#date': 'date' // date is a reserved word, so use ExpressionAttributeNames to specify the attribute name
            },
            ExpressionAttributeValues: {
                ':id': requestID,
                ':date': date
            },
            ConsistentRead: true
        };

        const items = await documentClient.query(params).promise();

        let isExist = false;
        var hour = null;
        var minute = null;

        if (requestDetails.trigger == "wheneverlive") {
            //check if mode wheneverlive is present in the table
            isExist = items.Items.length > 0;
        } else if (requestDetails.trigger == "specifictime") {

            hour = parseInt(requestDetails.triggerTime.split(":")[0])
            minute = parseInt(requestDetails.triggerTime.split(":")[1])
            //specific time mode
            const triggerTime = moment().hour(hour).minute(minute).second(0);
            const currentTime = moment();

            // check if an entry with the same hour and minute as the trigger time already exists in the auto schedule table
            //use hour and minute
            const existingItem = items.Items.find(item => item.hour == hour && item.minute == minute);

            if (existingItem) {
                // entry already exists
                isExist = true;
                hour = moment().hour();
                minute = moment().minute();
                console.log("item already exists");
            } else {

                //check if trigger time is += 5 minutes of current time and if it is then trigger the action and isExist = false

                if (triggerTime.diff(currentTime, 'minutes') >= 0 && triggerTime.diff(currentTime, 'minutes') <= 10) {
                    // trigger the action
                    // your code to trigger the action goes here
                    isExist = false;
                } else {
                    isExist = true; // lie and say it exists as we don't want to trigger the action, as its not within the 5 minute window yet
                    console.log("not within 5 minutes")
                }

                console.log("diff", triggerTime.diff(currentTime, 'minutes'));
                console.log("isExist", isExist);
                console.log(hour,minute)
                console.log(moment().hour(),moment().minute())
            }
        }

        if (!isExist) {
            const params = {
                TableName: process.env.AUTO_SCHEDULE_TABLEV2 || 'griffin-autoscheduler-service-dev-AutoScheduleV2Table-1OQJML172K83Y',
                Item: {
                    "recordrequestid": requestID,
                    "date": moment().format('YYYY-MM-DD'),
                    "time": moment().format('HH:mm:ss'),
                    "hour": hour,
                    "minute": minute,
                }
            };

            const l = await documentClient.put(params).promise();
        }

        resolve(isExist);
    })
}

function checkWhichRequestsShouldTrigger({
    requests
}) {
    return new Promise(async (resolve, reject) => {

        var requestsToTrigger = [];

        for (var i = 0; i < requests.length; i++) {
            const request = requests[i];

            const exists = await checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
                requestID: request.id,
                date: moment().format('YYYY-MM-DD')
            });

            if (!exists) {
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
}) {
    return new Promise(async (resolve, reject) => {

        try {

            const record = await makeRecordRequest({
                requestId: request.id,
            });

            const params = {
                TableName: process.env.AUTO_RECORD_TABLE || 'RecordAutoRecordTable',
                Item: {
                    id: record.recordId,
                    date: moment().format('YYYY-MM-DD'),
                    username: username,
                    livelink: livelink,
                    request,
                    recordrequestid: request.id,
                    recordid: record.recordId,
                    status: "pending"
                }
            }

            const result = await documentClient.put(params).promise();

            resolve(result);
        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}



module.exports = {
    checkWhichRequestsShouldTrigger,
    markAsRecording
}