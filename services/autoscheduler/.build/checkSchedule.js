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
const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
function handleFunc() {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "AggregateCurrentYoutuberLive",
            };
            const data = await documentClient.scan(params).promise();
            var allYoutubersEligibleToCheck = [];
            if (data.Items) {
                for (let i = 0; i < data.Items.length; i++) {
                    const lastUpdated = (0, moment_1.default)(data.Items[i].updatedAt);
                    const currentTime = (0, moment_1.default)().subtract(1, 'hour');
                    const diff = currentTime.diff(lastUpdated, 'minutes');
                    if (diff < 30 && data.Items[i].isLive === true) {
                        allYoutubersEligibleToCheck.push(data.Items[i]);
                    }
                }
                for (let i = 0; i < allYoutubersEligibleToCheck.length; i++) {
                    const params = {
                        QueueUrl: process.env.CHECK_SCHEDULE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/griffin-autoscheduler-service-dev-CheckScheduleQueue",
                        MessageBody: JSON.stringify({
                            youtuber: allYoutubersEligibleToCheck[i].youtubeusername
                        })
                    };
                    await sqs.sendMessage(params).promise();
                }
            }
            console.log("allYoutubersEligibleToCheck", allYoutubersEligibleToCheck.length);
            resolve(true);
        }
        catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}
module.exports.handler = async (event) => {
    try {
        await handleFunc();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success",
            }),
        };
    }
    catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: e,
                currentTime: (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss")
            }),
        };
    }
};
