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
exports.scheduleMuxJobECS = exports.getRecordEventByRecordId = exports.sendRecordDataTOApi = exports.getRecordRequestById = exports.sendRecordingToShitpost = exports.updateRecordStatuses = exports.updateRecordStatus = exports.addRecordEvent = exports.AddMuxingRequestToQueue = void 0;
const aws = __importStar(require("aws-sdk"));
const moment_1 = __importDefault(require("moment"));
const axios_1 = __importDefault(require("axios"));
const discordHelper_1 = require("./discordHelper");
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1",
});
const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || "us-east-1",
});
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function AddMuxingRequestToQueue({ jobId, reqId, videoLink, audioLink }) {
    return new Promise(async (resolve, reject) => {
        const params = {
            QueueUrl: process.env.MUXING_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/MuxingQueue",
            MessageBody: JSON.stringify({
                jobId,
                reqId,
                videoLink: videoLink,
                audioLink: audioLink
            })
        };
        try {
            const lt = await sqs.sendMessage(params).promise();
            resolve(lt);
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.AddMuxingRequestToQueue = AddMuxingRequestToQueue;
function addRecordEvent({ Job, Status, Recordid, }) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_EVENT_TABLE || "RecordEventTable",
            Item: {
                id: uuidv4(),
                recordid: Recordid,
                date: (0, moment_1.default)().format("YYYY-MM-DD"),
                job: Job,
                status: Status,
                createdAt: new Date().getTime(),
            },
        };
        try {
            documentClient.put(params).promise();
            resolve(true);
        }
        catch (err) {
            resolve(false);
        }
    });
}
exports.addRecordEvent = addRecordEvent;
function updateRecordStatus({ jobId, reqId, result, state, channelName }) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_TABLE || "RecordTable",
            Item: {
                id: jobId,
                recordrequestid: reqId,
                date: (0, moment_1.default)().format("YYYY-MM-DD"),
                keys: result,
                status: state,
                username: channelName,
                createdAt: new Date().getTime(),
                friendlyName: "--"
            },
        };
        try {
            const c = await documentClient.put(params).promise();
            resolve(c);
        }
        catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
exports.updateRecordStatus = updateRecordStatus;
function updateRecordStatuses({ jobId, state, }) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RecordStatusesTable || "RecordStatuses",
            Key: {
                id: jobId
            },
            UpdateExpression: "set #status = :s, #date = :d",
            ExpressionAttributeNames: {
                "#status": "status",
                "#date": "timeended" // add this line
            },
            ExpressionAttributeValues: {
                ":s": state,
                ":d": (0, moment_1.default)().unix() // add this line to set the date value to the current time in ISO format
            }
        };
        try {
            var c = await documentClient.update(params).promise();
            resolve(c);
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.updateRecordStatuses = updateRecordStatuses;
function sendRecordingToShitpost({ url }) {
    return new Promise(async (resolve, reject) => {
        try {
            await (0, discordHelper_1.sendShitpostLink)(`- ${url}`);
            resolve(true);
        }
        catch (err) {
            resolve(false);
        }
    });
}
exports.sendRecordingToShitpost = sendRecordingToShitpost;
function getRecordRequestById({ id }) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
            Key: {
                id: id
            }
        };
        try {
            const c = await documentClient.get(params).promise();
            resolve(c);
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.getRecordRequestById = getRecordRequestById;
function sendRecordDataTOApi({ data }) {
    return new Promise(async (resolve, reject) => {
        //use axios and timeout is 10 seconds
        try {
            const c = await axios_1.default.post("https://streamcatcher.herokuapp.com/tracker/callbackRecordStatus", data, {
                timeout: 10000
            });
            resolve(c);
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.sendRecordDataTOApi = sendRecordDataTOApi;
function getRecordEventByRecordId({ id }) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_EVENT_TABLE || "RecordEventTable",
            IndexName: "record-id-index",
            KeyConditionExpression: "recordid = :id",
            ExpressionAttributeValues: {
                ":id": id
            },
        };
        try {
            const c = await documentClient.query(params).promise();
            resolve(c);
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.getRecordEventByRecordId = getRecordEventByRecordId;
function scheduleMuxJobECS({ jobId, reqId, videoLink, audioLink }) {
    return new Promise((resolve, reject) => {
        const params = {
            MessageBody: JSON.stringify({
                jobId: jobId,
                reqId: reqId,
                videoLink: videoLink,
                audioLink: audioLink,
            }),
            QueueUrl: process.env.MUXING_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/MuxingQueue"
        };
        sqs.sendMessage(params, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.scheduleMuxJobECS = scheduleMuxJobECS;
console.log("Loaded DB");
scheduleMuxJobECS({
    jobId: "6f00e51c-03df-48da-94d6-ce4e82892408",
    reqId: "e3d035ac-fbe2-49e3-812e-327c6fb5f342",
    videoLink: "https://d213lwr54yo0m8.cloudfront.net/0_847cea34-6d09-4adb-9700-6cdae6b5c469.mp4",
    audioLink: "https://d213lwr54yo0m8.cloudfront.net/1_847cea34-6d09-4adb-9700-6cdae6b5c469.mp4"
}).then((d) => {
    console.log(d);
});
