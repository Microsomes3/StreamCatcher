"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAutoV3ScheduleMarker = exports.deleteMarkerAutoV3 = exports.markAsRecording = exports.checkWhichRequestsShouldTrigger = exports.getRecordRequestById = void 0;
const aws = __importStar(require("aws-sdk"));
const databasehelperv2_1 = require("./databasehelperv2");
const submitRecordingsRequest_1 = require("./submitRecordingsRequest");
const moment_1 = __importDefault(require("moment"));
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
            };
            const results = await documentClient.get(params).promise();
            resolve(results.Item || {});
        }
        catch (e) {
            console.log(e);
            reject({});
        }
    });
}
exports.getRecordRequestById = getRecordRequestById;
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
        const item = await (0, databasehelperv2_1.getScheduledTask)(id);
        if (item == null) {
            resolve(false);
            return;
        }
        const ttime = item.hour + ":" + item.minute + ":00";
        const ttimeM = (0, moment_1.default)(ttime, "HH:mm:ss");
        const now = (0, moment_1.default)();
        const diff = now.diff(ttimeM, 'seconds');
        if (diff >= 0 && diff <= intervalTimeSeconds) {
            resolve(true);
            return;
        }
        resolve(false);
    });
}
function handleSpecificTimeHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id, trigger, triggerTime } = requestDetails;
            console.log("sepcific time");
            var ltriggerTime = triggerTime;
            const nmtriggerTime = (0, moment_1.default)(ltriggerTime, "HH:mm:ss");
            console.log("nmtriggerTime", nmtriggerTime);
            const now = (0, moment_1.default)();
            const diff = nmtriggerTime.diff(now, 'minutes');
            console.log("diff", diff);
            if (diff >= 0 && diff <= 3) {
                //check if no items if so trigger
                var hour = ltriggerTime.split(":")[0];
                var minute = ltriggerTime.split(":")[1];
                //check if exists
                const item = await (0, databasehelperv2_1.getScheduledTask)(id);
                if (item == null) {
                    console.log("doesnt exist");
                    resolve(false);
                }
                resolve(true);
            }
            else {
                console.log("not within range");
                resolve(true);
            }
        }
        catch (e) {
            console.log(e);
            resolve(true);
        }
    });
}
function handleWheneverLiveHandler(requestDetails, dateToUse) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id } = requestDetails;
            const isExist = await (0, databasehelperv2_1.checkIfRequestExists)(id);
            resolve(isExist);
        }
        catch (e) {
            console.log(e);
            resolve(true);
        }
    });
}
function checkRequestIDExistsInAutoRecordTableWithSpecifiedDate(requestID, date) {
    return new Promise(async (resolve, reject) => {
        var isExist = true;
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
        switch (requestDetails.trigger) {
            case "interval":
                hour = (0, moment_1.default)().format('HH');
                minute = (0, moment_1.default)().format('mm');
                break;
            case "specifictime":
                try {
                    hour = requestDetails.triggerTime.split(":")[0];
                    minute = requestDetails.triggerTime.split(":")[1];
                }
                catch (e) { }
                break;
            case "wheneverlive":
                hour = (0, moment_1.default)().format('HH');
                minute = (0, moment_1.default)().format('mm');
                break;
        }
        console.log(isExist, hour, minute);
        if (!isExist) {
            try {
                console.log("hour", requestDetails);
                await (0, databasehelperv2_1.addScheduledTask)(requestID, hour, minute, requestDetails.trigger, requestDetails.username);
            }
            catch (e) {
                //log this request id to file
                const fs = require('fs');
                fs.appendFile('error.txt', requestID + '\n', function () { });
            }
        }
        resolve(isExist);
    });
}
function checkWhichRequestsShouldTrigger(requests) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("ltrov");
            var requestsToTrigger = [];
            for (var i = 0; i < requests.length; i++) {
                const request = requests[i];
                console.log(request.id);
                const exists = await checkRequestIDExistsInAutoRecordTableWithSpecifiedDate(request.id, (0, moment_1.default)().format('YYYY-MM-DD'));
                console.log("exists", exists);
                if (!exists) {
                    requestsToTrigger.push(request);
                }
            }
            console.log(">", requestsToTrigger);
            resolve(requestsToTrigger);
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.checkWhichRequestsShouldTrigger = checkWhichRequestsShouldTrigger;
function markAsRecording(username, livelink, request) {
    return new Promise(async (resolve, reject) => {
        try {
            const record = await (0, submitRecordingsRequest_1.makeRecordRequest)(request.id, true, request.provider);
            const params = {
                TableName: process.env.AUTO_RECORD_TABLE || 'RecordAutoRecordTable',
                Item: {
                    id: record.recordId,
                    date: (0, moment_1.default)().format('YYYY-MM-DD'),
                    username: username,
                    livelink: livelink,
                    request,
                    recordrequestid: request.id,
                    recordid: record.recordId,
                    status: "pending"
                }
            };
            const result = await documentClient.put(params).promise();
            resolve(result);
        }
        catch (e) {
            console.log(e);
            reject(e);
        }
    });
}
exports.markAsRecording = markAsRecording;
function deleteMarkerAutoV3({ recordrequestid }) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.AUTO_SCHEDULE_TABLEV3 || "griffin-autoscheduler-service-dev-AutoScheduleV3Table-SDFUN2OI5LO5",
            Key: {
                recordrequestid
            }
        };
        documentClient.delete(params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.deleteMarkerAutoV3 = deleteMarkerAutoV3;
function deleteAutoV3ScheduleMarker({ username }) {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                TableName: process.env.AUTO_SCHEDULE_TABLEV3 || "griffin-autoscheduler-service-dev-AutoScheduleV3Table-SDFUN2OI5LO5",
            };
            const data = await documentClient.scan(params).promise();
            const itemsToDelete = [];
            if (data.Items) {
                data.Items.forEach(async (item) => {
                    const c = item.channel;
                    if (c == username) {
                        itemsToDelete.push(item.recordrequestid);
                    }
                });
            }
            for (var i = 0; i < itemsToDelete.length; i++) {
                const recordrequestid = itemsToDelete[i];
                await deleteMarkerAutoV3({
                    recordrequestid
                });
            }
            resolve(true);
        }
        catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}
exports.deleteAutoV3ScheduleMarker = deleteAutoV3ScheduleMarker;
