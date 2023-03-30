const aws = require('aws-sdk');
const {
    getAllItemsOnDateAndRequest,
    addCronItem

} = require('./db')

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

        const intervalTime = convertTriggerTimeToMoment(triggerInterval);
        const date = dateToUse;
        const lid = id.toString();
        const items = await getAllItemsOnDateAndRequest(id, date);

        if (items.length == 0) {
            resolve(false);
            return;
        }

        const lastItem = items[items.length - 1];

        const created = moment(lastItem.created)
        const now = moment();

        console.log("created", created);
        console.log("now", now);

        const diff = now.diff(created, 'seconds');

        console.log(diff);

        if (diff > intervalTime) {
            resolve(false);
            return;
        }


        resolve(true);
    })
}

function handleSpecificTimeHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        const { id, trigger, triggerTime } = requestDetails;

        console.log("sepcific time")

        var ltriggerTime = triggerTime;

        const nmtriggerTime = moment(ltriggerTime, "HH:mm:ss");

        console.log("nmtriggerTime", nmtriggerTime);

        const items = await getAllItemsOnDateAndRequest(id, dateToUse);

        const now = moment();
        const diff = nmtriggerTime.diff(now, 'minutes');

        if (diff > 0 && diff <= 5) {
            //check if no items if so trigger
            if (items.length == 0) {
                resolve(false);
                return;
            }

            var hour = ltriggerTime.split(":")[0];
            var minute = ltriggerTime.split(":")[1];

            //check if exists
            const exists = items.filter((item) => {
                if (item.hour == hour && item.minute == minute) {
                    return true;
                }
            })

            if (exists.length == 0) {
                resolve(false);
                return;
            }

            resolve(true);

        } else {
            console.log("not within range")

            resolve(true);
        }

    })
}

function handleWheneverLiveHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        const { id, trigger, triggerTime } = requestDetails;

        console.log("lll")

        const items = await getAllItemsOnDateAndRequest(id, dateToUse);


        console.log("items", items);


        if (items.length == 0) {
            resolve(false);
            return;
        }

        resolve(true);
    })
}

function checkRequestIDExistsInAutoRecordTableWithSpecifiedDate({
    requestID,
    date,
}) {
    return new Promise(async (resolve, reject) => {

        let isExist = true;


        const requestDetails = await getRecordRequestById(requestID);

        console.log(requestDetails)

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



        if (!isExist) {

            var hour = "--";
            var minute = "--";

            try{
                 hour = requestDetails.triggerTime.split(":")[0];
             minute = requestDetails.triggerTime.split(":")[1];
            }catch(e){}

            try{
           

            console.log("hour", requestDetails);

            addCronItem(requestID, date, hour, minute);
            }catch(e){

                //log this request id to file
                const fs = require('fs');
                fs.appendFile('error.txt', requestID +'\n', function (err) {});

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