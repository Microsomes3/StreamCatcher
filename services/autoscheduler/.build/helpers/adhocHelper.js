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
exports.triggerRecordAdhoc = exports.createRecordRequestAdhoc = exports.AllowedPlatforms = void 0;
const aws = __importStar(require("aws-sdk"));
const moment_1 = __importDefault(require("moment"));
const recordHelper_1 = require("./recordHelper");
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1'
});
var AllowedPlatforms;
(function (AllowedPlatforms) {
    AllowedPlatforms["Twitch"] = "twitch";
    AllowedPlatforms["YouTube"] = "youtube";
})(AllowedPlatforms = exports.AllowedPlatforms || (exports.AllowedPlatforms = {}));
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}
const createRecordRequestAdhoc = async (accountId, email, channelName, platform, duration) => {
    return new Promise(async (resolve, reject) => {
        const reqid = uuidv4();
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
            Item: {
                id: reqid,
                accountId: accountId,
                email: email,
                duration: duration,
                friendlyCreatedAt: (0, moment_1.default)().format('MMMM Do YYYY, h:mm:ss a'),
                isComments: false,
                isRecordStart: false,
                label: "adhoc_generated" + reqid,
                maxparts: 1,
                minruntime: 5,
                provider: platform,
                trigger: "adhoc_generated",
                triggerInterval: "n/a",
                triggerTime: "n/a",
                username: channelName,
            }
        };
        try {
            await documentClient.put(params).promise();
            resolve(reqid);
        }
        catch (err) {
            console.log(err);
            reject(err);
        }
    });
};
exports.createRecordRequestAdhoc = createRecordRequestAdhoc;
const triggerRecordAdhoc = async (reqid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const request = await (0, recordHelper_1.getRecordRequestById)(reqid);
            const ToAddMessage = {
                request,
                auto: false
            };
            const params = {
                MessageBody: JSON.stringify(ToAddMessage),
                QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/griffin-autoscheduler-service-dev-AutoScheduleQueue"
            };
            await new aws.SQS({
                region: process.env.AWS_REGION_T || 'us-east-1',
            }).sendMessage(params).promise();
            resolve(true);
        }
        catch (err) {
            console.log(err);
            resolve(false);
        }
    });
};
exports.triggerRecordAdhoc = triggerRecordAdhoc;
