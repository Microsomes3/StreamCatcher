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
exports.makeRecordRequest = exports.submitJobToEcsv2 = exports.overlayCommentTask = exports.captureCommentVideoV2Task = exports.captureCommentRunTask = void 0;
const aws = __importStar(require("aws-sdk"));
const moment_1 = __importDefault(require("moment"));
const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function captureCommentRunTask({ username, duration }) {
    return new Promise((resolve, reject) => {
        const taskDef = "GoCommentCaptureTask";
        const containerName = "GoCommentCaptureContainer";
        const ecsparams = {
            cluster: "griffin-record-cluster",
            taskDefinition: taskDef,
            launchType: "FARGATE",
            //extra env vars
            overrides: {
                containerOverrides: [
                    {
                        name: containerName,
                        environment: [
                            {
                                name: 'username',
                                value: username
                            },
                            {
                                name: 'timeout',
                                value: duration.toString()
                            }
                        ],
                    },
                ],
            },
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            tags: [
                {
                    key: "username",
                    value: username
                }
            ]
        };
        ecs.runTask(ecsparams, function (err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            }
            else {
                console.log("Success", data);
                resolve(data);
            }
        });
    });
}
exports.captureCommentRunTask = captureCommentRunTask;
function captureCommentVideoV2Task({ jobId, username, timeout, callbackurl }) {
    return new Promise((resolve, reject) => {
        const ecsparams = {
            cluster: "griffin-record-cluster",
            taskDefinition: "GoCommentCaptureVideoV2",
            launchType: "FARGATE",
            //extra env vars
            overrides: {
                containerOverrides: [
                    {
                        name: "GoCommentCaptureVideoContainerV2",
                        environment: [
                            {
                                name: 'updateApi',
                                value: callbackurl
                            },
                            {
                                name: 'username',
                                value: username
                            },
                            {
                                name: 'timeout',
                                value: timeout.toString()
                            },
                            {
                                name: 'jobId',
                                value: jobId
                            }
                        ],
                    },
                ],
            },
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            tags: [
                {
                    key: "username",
                    value: username
                }
            ]
        };
        ecs.runTask(ecsparams, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.captureCommentVideoV2Task = captureCommentVideoV2Task;
function overlayCommentTask({ video, comment }) {
    return new Promise((resolve, reject) => {
        const ecsparams = {
            cluster: "griffin-record-cluster",
            taskDefinition: "GoCommentOverlay",
            launchType: "FARGATE",
            //extra env vars
            overrides: {
                containerOverrides: [
                    {
                        name: "GoCommentOverlayContainer",
                        environment: [
                            {
                                name: 'COMMENT_VIDEO_URL',
                                value: comment
                            },
                            {
                                name: 'VIDEO_URL',
                                value: video
                            },
                        ],
                    },
                ],
            },
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            tags: []
        };
        ecs.runTask(ecsparams, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.overlayCommentTask = overlayCommentTask;
function submitJobToEcs(username, requestId, uniqueRecordId, duration, isRecordStart, provider, tryToCaptureAll) {
    return new Promise(async (resolve, reject) => {
        const ecsparams = {
            enableExecuteCommand: true,
            cluster: "griffin-record-cluster",
            taskDefinition: "griffin-autoscheduler-service-dev-GOEcsTask",
            launchType: "FARGATE",
            //extra env vars
            overrides: {
                containerOverrides: [
                    {
                        name: 'griffin-autoscheduler-service-dev-GOEcsContainer',
                        environment: [
                            {
                                name: 'reqid',
                                value: requestId
                            },
                            {
                                name: 'updatehook',
                                value: 'https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoOnUpdateRecordCallback'
                            },
                            {
                                name: 'url',
                                value: provider == "youtube" ? `https://www.youtube.com/${username}/live` : `https://www.twitch.tv/${username}/live`
                            },
                            {
                                name: 'provider',
                                value: provider
                            },
                            {
                                name: "RECORD_REQUEST_ID",
                                value: requestId
                            },
                            {
                                name: "jobid",
                                value: uniqueRecordId
                            },
                            {
                                name: "isstart",
                                value: provider == "twitch" ? "false" : isRecordStart == true ? "true" : "false"
                            },
                            {
                                name: "timeout",
                                value: duration.toString()
                            },
                            {
                                name: "tryToCaptureAll",
                                value: tryToCaptureAll
                            }
                        ],
                    },
                ],
            },
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            tags: [
                {
                    key: "recordid",
                    value: uniqueRecordId
                }
            ]
        };
        const ecsdata = await ecs.runTask(ecsparams).promise();
        var taskArn = null;
        if (ecsdata.tasks) {
            taskArn = ecsdata.tasks[0].taskArn;
        }
        resolve(taskArn);
    });
}
function submitJobToEcsv2(username, requestId, uniqueRecordId, duration, isRecordStart, provider, tryToCaptureAll, engine, resolution) {
    return new Promise(async (resolve, reject) => {
        const ecsparams = {
            enableExecuteCommand: true,
            cluster: "griffin-record-cluster",
            taskDefinition: "griffin-autoscheduler-service-dev-GOEcsTaskv2",
            launchType: "FARGATE",
            //extra env vars
            overrides: {
                containerOverrides: [
                    {
                        name: 'griffin-autoscheduler-service-dev-GOEcsContainerv2',
                        environment: [
                            {
                                name: "res",
                                value: resolution.toString()
                            },
                            {
                                name: "engine",
                                value: engine.toString()
                            },
                            {
                                name: 'reqid',
                                value: requestId.toString()
                            },
                            {
                                name: 'updatehook',
                                value: 'https://new.liveclipper.com/api/injest/recording'
                            },
                            {
                                name: 'url',
                                value: provider == "youtube" ? `https://www.youtube.com/${username}/live` : `https://www.twitch.tv/${username}/live`
                            },
                            {
                                name: 'provider',
                                value: provider
                            },
                            {
                                name: "RECORD_REQUEST_ID",
                                value: requestId
                            },
                            {
                                name: "jobid",
                                value: uniqueRecordId
                            },
                            {
                                name: "isstart",
                                value: provider == "twitch" ? "false" : isRecordStart == true ? "true" : "false"
                            },
                            {
                                name: "timeout",
                                value: duration.toString()
                            },
                            {
                                name: "tryToCaptureAll",
                                value: tryToCaptureAll
                            }
                        ],
                    },
                ],
            },
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            tags: [
                {
                    key: "recordid",
                    value: uniqueRecordId
                }
            ]
        };
        const ecsdata = await ecs.runTask(ecsparams).promise();
        var taskArn = null;
        if (ecsdata.tasks) {
            taskArn = ecsdata.tasks[0].taskArn;
        }
        resolve(taskArn);
    });
}
exports.submitJobToEcsv2 = submitJobToEcsv2;
function makeRecordRequest(requestId, auto, provider = "youtube") {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(">>", requestId);
            const documentWriter = new aws.DynamoDB.DocumentClient({
                region: process.env.AWS_REGION_T || 'us-east-1'
            });
            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
                Key: {
                    id: requestId
                }
            };
            const data = await documentWriter.get(params).promise();
            if (!data.Item) {
                reject({
                    statusCode: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    },
                    body: JSON.stringify({
                        error: "Record not found!"
                    }),
                });
            }
            const { tryToCaptureAll = "no", captureSystem = "ecs", duration, isRecordStart = false, isComments = false, username } = data.Item;
            console.log({
                captureSystem,
                duration,
                isRecordStart,
                isComments,
                username,
                tryToCaptureAll
            });
            if (!data.Item) {
                reject({
                    statusCode: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    },
                    body: JSON.stringify({
                        error: "Record not found!"
                    }),
                });
            }
            const uniqueRecordId = uuidv4();
            var sid = "";
            sid = await submitJobToEcs(username, requestId, uniqueRecordId, duration, isRecordStart, provider, tryToCaptureAll);
            console.log(sid, data.Item);
            if (isComments) {
                await captureCommentRunTask({
                    username: username,
                    duration: duration,
                });
                await captureCommentVideoV2Task({
                    jobId: uniqueRecordId,
                    username: username,
                    timeout: duration.toString(),
                    callbackurl: 'https://new.liveclipper.com/api/injest/comment-event'
                });
            }
            const paramsStatuses = {
                TableName: process.env.RECORD_STATUS_TABLE || 'RecordStatuses',
                Item: {
                    id: uniqueRecordId,
                    recordrequestid: requestId,
                    status: "PENDING",
                    username: username,
                    friendlyDate: (0, moment_1.default)().format("YYYY-MM-DD"),
                    timestarted: (0, moment_1.default)().unix(),
                    timeended: null,
                    createdAt: new Date().getTime(),
                    kubejobid: sid,
                    progressState: {
                        currentRecordedRunTime: 0,
                        totalParts: 0,
                        storageUsed: 0,
                        totalTime: 0
                    }
                },
            };
            await documentWriter.put(paramsStatuses).promise();
            try {
                const addRecordTablePending = {
                    TableName: process.env.RECORD_TABLE || 'RecordTable',
                    Item: {
                        id: uniqueRecordId,
                        recordrequestid: requestId,
                        date: (0, moment_1.default)().format("YYYY-MM-DD"),
                        keys: [],
                        username: username,
                        status: "pending",
                        kubejobid: sid,
                        createdAt: new Date().getTime(),
                    },
                };
                await documentWriter.put(addRecordTablePending).promise();
            }
            catch (e) {
                console.log(e);
            }
            resolve({
                statusCode: 200,
                recordId: uniqueRecordId,
            });
        }
        catch (e) {
            console.log(e);
            reject(e);
        }
    });
}
exports.makeRecordRequest = makeRecordRequest;
