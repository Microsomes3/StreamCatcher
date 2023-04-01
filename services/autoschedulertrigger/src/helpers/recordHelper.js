const aws = require('aws-sdk');

const {
    checkIfRequestExists,
    addScheduledTask,
    getScheduledTask
} = require('./databaseHelper')

const { makeRecordRequest } = require('./submitRecordingsRequest')

const moment = require('moment');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

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


function convertTriggerTimeToMoment(triggerTime) {
    //example input 5m 10m 20m 1hr output should be for 5m = 300 seconds

    const time = triggerTime.replace("m", "").replace("hr", "").trim();
    const timeType = triggerTime.replace(time, "").trim();

    let timeToReturn = 0;

    switch (timeType) {
        case "m":
            timeToReturn = time * 60;
            break;
        case "hr":
            timeToReturn = time * 60 * 60;
            break;
    }

    return timeToReturn;
}

function handleIntervelHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        const { id, trigger, triggerInterval } = requestDetails;
        const intervalTimeSeconds = convertTriggerTimeToMoment(triggerInterval);


        const item = await getScheduledTask({
            requestid: id
        })

        if(item == null){
            resolve(false);
            return;
        }

        const ttime= item.hour+":"+item.minute+":00";
        const ttimeM = moment(ttime, "HH:mm:ss");
        const now = moment();

        const diff = now.diff(ttimeM, 'seconds');

        
        if (diff >= 0 && diff <= intervalTimeSeconds) {
            resolve(true);
            return;
        }

        resolve(false);
        
    })
}

function handleSpecificTimeHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id, trigger, triggerTime } = requestDetails;

            console.log("sepcific time")

            var ltriggerTime = triggerTime;

            const nmtriggerTime = moment(ltriggerTime, "HH:mm:ss");

            console.log("nmtriggerTime", nmtriggerTime);

            const now = moment();
            const diff = nmtriggerTime.diff(now, 'minutes');

            console.log("diff", diff);

            if (diff >= 0 && diff <= 3) {
                //check if no items if so trigger
                var hour = ltriggerTime.split(":")[0];
                var minute = ltriggerTime.split(":")[1];

                //check if exists
                const item = await getScheduledTask({
                    requestid: id
                })

                if (item == null) {
                    console.log("doesnt exist");
                    resolve(false);
                }

                resolve(true);


            } else {
                console.log("not within range")

                resolve(true);
            }
        } catch (e) {
            console.log(e);
            resolve(true);
        }

    })
}

function handleWheneverLiveHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id } = requestDetails;
            const isExist = await checkIfRequestExists({
                requestid: id,
            })

            resolve(isExist);
        } catch (e) {
            console.log(e);
            resolve(true)
        }

    })
}

function checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
    requestID,
    date,
}) {
    return new Promise(async (resolve, reject) => {

        let isExist = true;
        const requestDetails = await getRecordRequestById(requestID);

        switch (requestDetails.trigger) {
            case "interval":
                isExist = await handleIntervelHandler(requestDetails, date);
                break;
            case "specifictime":
                isExist = await handleSpecificTimeHandler(requestDetails, date);
                break;
            case "wheneverlive":
                isExist = await handleWheneverLiveHandler(requestDetails, date);
                break;

        }

        var hour = "--";
        var minute = "--";

        switch(requestDetails.trigger){
            case "interval":
                hour = moment().format('HH');
                minute = moment().format('mm');
                break;
            case "specifictime":
                try {
                    hour = requestDetails.triggerTime.split(":")[0];
                    minute = requestDetails.triggerTime.split(":")[1];
                } catch (e) { }
                break;
            case "wheneverlive":
                hour = moment().format('HH');
                minute = moment().format('mm');
                break;
        }


        console.log(isExist, hour, minute)

        if (!isExist) {
            try {

                console.log("hour", requestDetails);

                await addScheduledTask({
                    requestid: requestID,
                    hour,
                    minute,
                    trigger: requestDetails.trigger,
                    username:requestDetails.username,
                })
            } catch (e) {

                //log this request id to file
                const fs = require('fs');
                fs.appendFile('error.txt', requestID + '\n', function (err) { });
            }

        }

        resolve(isExist);
    })
}

function checkWhichRequestsShouldTrigger({
    requests,
}) {
    return new Promise(async (resolve, reject) => {

        var requestsToTrigger = [];

        for (var i = 0; i < requests.length; i++) {
            const request = requests[i];

            const exists = await checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
                requestID: request.id,
                date: moment().format('YYYY-MM-DD'),
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