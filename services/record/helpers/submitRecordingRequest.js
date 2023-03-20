const aws = require('aws-sdk');
const sha256 = require('crypto-js/sha256');


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

function makeRecordRequest({ requestId }) {
    return new Promise(async (resolve, reject) => {

        console.log(">>",requestId);

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

        const dsscribeStack = {
            StackName: sname
        };
    
        const stackDef = await cloudformation.describeStacks(dsscribeStack).promise();
    
        const ecsname = stackDef.$response.data.Stacks[0].Outputs[0].OutputValue;

      
        //ecs run task with ecsname task definition
        const ecs = new aws.ECS({
            region: process.env.AWS_REGION_T || 'us-east-1',
        });

        const uniqueRecordId=  uuidv4();

        const ecsparams = {
            cluster: "griffin-record-cluster",
            taskDefinition: ecsname,
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
        };
    
        const ecsdata = await ecs.runTask(ecsparams).promise();
    
        const taskArn = ecsdata.tasks[0].taskArn;
    
        const paramsStatuses = {
            TableName: process.env.RecordStatusesTable || 'RecordStatuses',
            Item: {
                id: uniqueRecordId,
                recordrequestid: requestId,
                taskArn: taskArn,
                status: "PENDING",
                createdAt: new Date().getTime(),
            },
        };
        
        await documentWriter.put(paramsStatuses).promise();
    
        resolve({
            statusCode: 200,
            recordId: uniqueRecordId,
            taskArn: taskArn,
        });

    })
}

module.exports = {
    makeRecordRequest
}