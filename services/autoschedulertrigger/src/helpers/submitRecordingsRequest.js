const aws = require('aws-sdk');
const sha256 = require('crypto-js/sha256');
const moment = require('moment');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

function makeRecordRequest({ requestId }) {
    return new Promise(async (resolve, reject) => {

        try {

            console.log(">>", requestId);

            const documentWriter = new aws.DynamoDB.DocumentClient({
                region: process.env.AWS_REGION_T || 'us-east-1'
            });

            const cloudformation = new aws.CloudFormation({
                region: process.env.AWS_REGION_T || 'us-east-1'
            });

            const IdHash = sha256(requestId).toString();
            const sname = "c" + IdHash;

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
                Key: {
                    id: requestId
                }
            };

            const data = await documentWriter.get(params).promise();

            const maxparts = data.Item.maxparts || 1;

            const minruntime = data.Item.minruntime || 1

            const timeout = data.Item.duration+"s" || "30s"


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

            var ecsName = null;


            try {

                const dsscribeStack = {
                    StackName: sname
                };

                const stackDef = await cloudformation.describeStacks(dsscribeStack).promise();

                if(stackDef.Stacks[0].StackStatus == "CREATE_IN_PROGRESS"){
                    reject("Stack is still being created, please try again in a few minutes.");
                    return;
                }else{

                ecsName = stackDef.$response.data.Stacks[0].Outputs[0].OutputValue;
                }

            } catch (e) {
                reject(e);
            }


            //ecs run task with ecsname task definition
            const ecs = new aws.ECS({
                region: process.env.AWS_REGION_T || 'us-east-1',
            });

            const uniqueRecordId = uuidv4();

            const ecsparams = {
                cluster: "griffin-record-cluster",
                taskDefinition: ecsName,
                launchType: "FARGATE",
                //extra env vars
                overrides: {
                    containerOverrides: [
                        {
                            name: "griffin-record",
                            environment: [
                                {
                                    name: "RECORD_REQUEST_ID",
                                    value: requestId
                                },
                                {
                                    name: "RECORD_ID",
                                    value: uniqueRecordId
                                },
                                {
                                    name: "parts",
                                    value: maxparts.toString()
                                },
                                {
                                    name: "minruntime",
                                    value: minruntime.toString()
                                },
                                {
                                    name:"timeout",
                                    value: timeout

                                }
                            ]
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
                tags:[
                    {
                        key: "recordid",
                        value: uniqueRecordId
                    }
                ]
            };

            const ecsdata = await ecs.runTask(ecsparams).promise();

            const taskArn = ecsdata.tasks[0].taskArn;


            const paramsStatuses = {
                TableName: process.env.RECORD_STATUS_TABLE || 'RecordStatuses',
                Item: {
                    id: uniqueRecordId,
                    recordrequestid: requestId,
                    taskArn: taskArn,
                    status: "PENDING",
                    friendlyDate: moment().format("YYYY-MM-DD"),
                    timestarted: moment().unix(),
                    timeended: null,
                    createdAt: new Date().getTime(),
                    progressState:{
                        currentRecordedRunTime: 0,
                        totalParts: 0,
                        storageUsed: 0,
                        totalTime: 0
                    }
                },
            };

            await documentWriter.put(paramsStatuses).promise();

            resolve({
                statusCode: 200,
                recordId: uniqueRecordId,
                taskArn: taskArn,
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }

    })
}

module.exports = {
    makeRecordRequest
}