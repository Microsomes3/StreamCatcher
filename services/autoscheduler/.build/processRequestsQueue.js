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
const databasehelperv2_1 = require("./helpers/databasehelperv2");
const aws = __importStar(require("aws-sdk"));
const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
async function handleFunc(youtuber) {
    return new Promise(async (resolve, reject) => {
        const requests = await (0, databasehelperv2_1.getAllRecordRequestsToSchedule)({
            youtuber: youtuber
        });
        if (requests.length === 0) {
            resolve(false);
        }
        else {
            const all = requests[0];
            if (all.length == 0) {
                resolve(false);
                return;
            }
            for (let i = 0; i < all.length; i++) {
                const request = all[i];
                console.log(request);
                const params = {
                    QueueUrl: process.env.AUTO_SCHEDULE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/574134043875/griffin-autoscheduler-service-dev-AutoScheduleQueue",
                    MessageBody: JSON.stringify({
                        request: request,
                        auto: true
                    })
                };
                const c = await sqs.sendMessage(params).promise();
                console.log(c);
            }
            resolve(true);
        }
    });
}
module.exports.handler = async (event) => {
    //get message from queue
    const message = JSON.parse(event.Records[0].body);
    const youtuber = message.youtuber;
    const status = await handleFunc(youtuber);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: status
        }),
    };
};
