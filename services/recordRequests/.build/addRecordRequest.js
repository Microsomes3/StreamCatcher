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
const aws = __importStar(require("aws-sdk"));
const moment_1 = __importDefault(require("moment"));
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
module.exports.handler = async (event) => {
    const { provider = "youtube", username, duration, trigger, isComments, shouldRecordStart, label, triggerTime, triggerInterval } = JSON.parse(event.body);
    if (!username || !duration || !trigger || !label || !triggerTime || !triggerInterval) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required parameters',
                expected: [],
                gotten: Object.keys(event.body || {})
            }),
        };
    }
    //check of duration 
    if (isNaN(duration)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be numbers',
            }),
        };
    }
    if (duration <= 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be positive numbers',
            }),
        };
    }
    //check if duration is a whole number
    if (duration % 1 !== 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be whole numbers',
            }),
        };
    }
    //check if duration is less than 24 hours (in seconds)
    if (duration > 86400) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration must be less than 24 hours',
            }),
        };
    }
    //isComment should be boolean
    if (typeof isComments !== 'boolean') {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'isComments must be a boolean',
            }),
        };
    }
    //check if shouldRecordStart is a boolean
    if (typeof shouldRecordStart !== 'boolean') {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'shouldRecordStart must be a boolean',
            }),
        };
    }
    var acceptedIntervals = [
        "5m",
        "20m",
        "30m",
        "1hr",
        "2hr",
        "3hr"
    ];
    if (!acceptedIntervals.includes(triggerInterval)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'triggerInterval must be one of the following: 5m, 20m, 30m, 1hr, 2hr, 3hr',
            }),
        };
    }
    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE,
        Item: {
            id: uuidv4(),
            provider,
            username,
            duration,
            trigger,
            maxparts: 1,
            minruntime: 5,
            createdAt: (0, moment_1.default)().unix(),
            friendlyCreatedAt: (0, moment_1.default)().format('MMMM Do YYYY, h:mm:ss a'),
            isComments,
            isRecordStart: shouldRecordStart,
            label,
            triggerTime,
            triggerInterval
        },
    };
    const data = await documentClient.put(params).promise();
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            input: params,
            data,
        }),
    };
};
