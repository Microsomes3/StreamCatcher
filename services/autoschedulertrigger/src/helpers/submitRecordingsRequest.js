const aws = require('aws-sdk');
const sha256 = require('crypto-js/sha256');
const moment = require('moment');

const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});

const {
    scheduleMuxJob,
    scheduleStreamDownload
} = require("./scheduleKubeTasks")

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

function submitJobToJubernetes({
    username,
    requestId,
    uniqueRecordId,
    duration,
    isRecordStart,
    provider,
}) {
    return new Promise(async (resolve, reject) => {
        const sid = await scheduleStreamDownload({
            jobId: uniqueRecordId,
            reqId: requestId,
            duration: duration.toString(),
            isStart: isRecordStart == true ? "true" : "false",
            provider: provider,
            timeout: duration.toString(),
            url: provider === "youtube" ? `https://youtube.com/${username}/live` : `https://twitch.tv/${username}/live`,
        })
        resolve(sid);
    })
}

function submitJobToEcs({
    username,
    requestId,
    uniqueRecordId,
    duration,
    isRecordStart,
    provider,
}) {
    return new Promise(async(resolve, reject) => {
        const ecsparams = {
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

        const taskArn = ecsdata.tasks[0].taskArn;

        resolve(taskArn)

    })
}


function makeRecordRequest({ requestId, auto, provider = "youtube" }) {
    return new Promise(async (resolve, reject) => {

        console.log(">>", provider);


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

            const { captureSystem = "ecs", duration, isRecordStart = false, isComments = false, username } = data.Item;

            
            console.log({
                captureSystem,
                duration,
                isRecordStart,
                isComments,
                username,
            })



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

            if (captureSystem == "kubernetes") {
                sid = await submitJobToJubernetes({
                    username:username,
                    requestId:requestId,
                    uniqueRecordId:uniqueRecordId,
                    duration:duration,
                    isRecordStart:isRecordStart,
                    provider:provider,       
                })
            }else{
                sid = await submitJobToEcs({
                    username:username,
                    requestId:requestId,
                    uniqueRecordId:uniqueRecordId,
                    duration:duration,
                    isRecordStart:isRecordStart,
                    provider:provider,    
                })
            }

            const paramsStatuses = {
                TableName: process.env.RECORD_STATUS_TABLE || 'RecordStatuses',
                Item: {
                    id: uniqueRecordId,
                    recordrequestid: requestId,
                    status: "PENDING",
                    username: username,
                    friendlyDate: moment().format("YYYY-MM-DD"),
                    timestarted: moment().unix(),
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
                        date: moment().format("YYYY-MM-DD"),
                        keys: [],
                        username: username,
                        status: "pending",
                        kubejobid: sid,
                        createdAt: new Date().getTime(),
                    },
                };

                await documentWriter.put(addRecordTablePending).promise();
            } catch (e) {
                console.log(e);
            }

            resolve({
                statusCode: 200,
                recordId: uniqueRecordId,
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }

    })
}


// makeRecordRequest({
//     requestId: "d2fd2c46-cd94-4e09-88a3-b9f025811a50",
//     auto:"",
//     provider:"youtube"
// })


module.exports = {
    makeRecordRequest
}