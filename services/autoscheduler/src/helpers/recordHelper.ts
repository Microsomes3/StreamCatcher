import * as aws from 'aws-sdk';

import {
    checkIfRequestExists,
    addScheduledTask,
    getScheduledTask
} from './databasehelperv2'

import { makeRecordRequest } from './submitRecordingsRequest'

import moment from 'moment';

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

export function getRecordRequestById(id:number) {
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


function convertTriggerTimeToMoment(triggerTime:any) {
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

function handleIntervelHandler(requestDetails:any, dateToUse:any):Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const { id, trigger, triggerInterval } = requestDetails;
        const intervalTimeSeconds = convertTriggerTimeToMoment(triggerInterval);

        const item:any = await getScheduledTask(id)

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

function handleSpecificTimeHandler(requestDetails:any, dateToUse:any):Promise<boolean> {
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
                const item = await getScheduledTask(id)

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

function handleWheneverLiveHandler(requestDetails:any, dateToUse:any):Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const { id } = requestDetails;
            const isExist = await checkIfRequestExists(id)

            resolve(isExist);
        } catch (e) {
            console.log(e);
            resolve(true)
        }

    })
}

function checkRequestIDExistsInAutoRecordTableWithSpecifiedDate(requestID:any,date:any,) {
    return new Promise(async (resolve, reject) => {

        var isExist:boolean = true;
        const requestDetails:any = await getRecordRequestById(requestID);

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

                await addScheduledTask(
                    requestID,
                    hour,
                    minute,
                    requestDetails.trigger,
                    requestDetails.username,
                )
            } catch (e) {

                //log this request id to file
                const fs = require('fs');
                fs.appendFile('error.txt', requestID + '\n', function () { });
            }

        }

        resolve(isExist);
    })
}

export function checkWhichRequestsShouldTrigger(requests:any) {
    return new Promise(async (resolve, reject) => {

        try{

        console.log("ltrov")

        var requestsToTrigger = [];
        
        for (var i = 0; i < requests.length; i++) {
            const request = requests[i];
            console.log(request.id);

            const exists = await checkRequestIDExistsInAutoRecordTableWithSpecifiedDate(
                request.id,
                moment().format('YYYY-MM-DD'),
            );

            console.log("exists", exists)

            if (!exists) {
                requestsToTrigger.push(request);
            }

        }

        console.log(">",requestsToTrigger)

        resolve(requestsToTrigger);
    }catch(e){
        console.log(e);
    }

    })
}



export function markAsRecording(
    username:string,
    livelink:string,
    request:any
) {
    return new Promise(async (resolve, reject) => {

        try {
            const record:any = await makeRecordRequest(
                request.id,
                true,
                request.provider
            );

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


