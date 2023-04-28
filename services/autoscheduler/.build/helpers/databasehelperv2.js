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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScheduledTask = exports.addScheduledTask = exports.checkIfRequestExists = exports.getAllRecordRequestsToSchedule = exports.getAllRecordRequestsByUsername = exports.deleteAllScheduledTasks = void 0;
const aws = __importStar(require("aws-sdk"));
const recordHelper_1 = require("./recordHelper");
const tableName = process.env.AUTO_SCHEDULE_TABLEV3 || "griffin-autoscheduler-service-dev-AutoScheduleV3Table-SDFUN2OI5LO5";
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1'
});
const getAllRecords = async (table) => {
    var params = {
        TableName: table,
    };
    let items = [];
    let data = await documentClient.scan(params).promise();
    if (data.Items) {
        items = [...items, ...data.Items];
        while (typeof data.LastEvaluatedKey !== "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            data = await documentClient.scan(params).promise();
            items = [...items, ...data.Items || []];
        }
    }
    return items;
};
function deleteAllScheduledTasks() {
    return new Promise(async (resolve, reject) => {
        try {
            getAllRecords(tableName).then(async (data) => {
                console.log("data", data.length);
                const batches = [];
                for (let i = 0; i < data.length; i++) {
                    if (i % 25 === 0) {
                        batches.push([]);
                    }
                    batches[batches.length - 1].push(data[i]);
                }
                for (let i = 0; i < batches.length; i++) {
                    console.log("batch", i + "/" + batches.length);
                    const deleteParams = {
                        RequestItems: {
                            [tableName]: []
                        }
                    };
                    batches[i].forEach((item) => {
                        deleteParams.RequestItems[tableName].push({
                            DeleteRequest: {
                                Key: {
                                    recordrequestid: item.recordrequestid
                                }
                            }
                        });
                    });
                    await documentClient.batchWrite(deleteParams).promise();
                }
                resolve(null);
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.deleteAllScheduledTasks = deleteAllScheduledTasks;
function getAllRecordRequestsByUsername(username) {
    return new Promise((resolve, reject) => {
        try {
            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
                IndexName: process.env.RECORD_RECORD_USERNAME_INDEX || "username-index",
                KeyConditionExpression: "username = :username",
                ExpressionAttributeValues: {
                    ":username": username
                }
            };
            const results = documentClient.query(params).promise();
            resolve(results);
        }
        catch (e) {
            console.log(e);
            reject([]);
        }
    });
}
exports.getAllRecordRequestsByUsername = getAllRecordRequestsByUsername;
function getAllRecordRequestsToSchedule(opt) {
    return new Promise(async (resolve, reject) => {
        try {
            var tableName = process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "AggregateCurrentYoutuberLive";
            var params = {
                TableName: tableName,
                KeyConditionExpression: "youtubeusername = :youtuber",
                ExpressionAttributeValues: {
                    ":youtuber": opt.youtuber
                }
            };
            const data = await documentClient.query(params).promise();
            if (data.Items) {
                const liveYoutubers = data.Items;
                const liveYoutubersFiltered = liveYoutubers.filter((youtuber) => {
                    return youtuber.isLive === true;
                });
                var allLiveUsernamesAndTheirRequests = [];
                for (let i = 0; i < liveYoutubersFiltered.length; i++) {
                    const username = liveYoutubersFiltered[i].youtubeusername;
                    const livelink = liveYoutubersFiltered[i].liveLink;
                    const requests = await getAllRecordRequestsByUsername(username);
                    allLiveUsernamesAndTheirRequests.push({
                        username,
                        livelink,
                        requests: requests.Items || []
                    });
                }
                //filter and remove all usernames that do not have any record requests
                allLiveUsernamesAndTheirRequests = allLiveUsernamesAndTheirRequests.filter((d) => {
                    return d.requests.length > 0;
                });
                console.log("allLiveUsernamesAndTheirRequests", allLiveUsernamesAndTheirRequests);
                var allRecordRequestsToTrigger = [];
                for (let i = 0; i < allLiveUsernamesAndTheirRequests.length; i++) {
                    const username = allLiveUsernamesAndTheirRequests[i].username;
                    const livelink = allLiveUsernamesAndTheirRequests[i].livelink;
                    const requests = allLiveUsernamesAndTheirRequests[i].requests;
                    console.log("checking for", username);
                    console.log("requests to check", requests.length);
                    const requestsToTrigger = await (0, recordHelper_1.checkWhichRequestsShouldTrigger)(requests);
                    console.log("requests to trigger", requestsToTrigger.length);
                    allRecordRequestsToTrigger.push(requestsToTrigger);
                }
            }
            console.log(allRecordRequestsToTrigger);
            resolve(allRecordRequestsToTrigger || []);
        }
        catch (err) {
            reject([]);
        }
    });
}
exports.getAllRecordRequestsToSchedule = getAllRecordRequestsToSchedule;
function checkIfRequestExists(requestid) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                recordrequestid: requestid
            }
        };
        try {
            const data = await documentClient.get(params).promise();
            if (data.Item) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
exports.checkIfRequestExists = checkIfRequestExists;
function addScheduledTask(requestid, hour, minute, trigger, channel) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
                recordrequestid: requestid,
                hour,
                minute,
                trigger,
                channel
            }
        };
        try {
            const data = await documentClient.put(params).promise();
            resolve(data);
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
exports.addScheduledTask = addScheduledTask;
function getScheduledTask(requestid) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                recordrequestid: requestid
            }
        };
        try {
            const data = await documentClient.get(params).promise();
            resolve(data.Item || null);
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
exports.getScheduledTask = getScheduledTask;
