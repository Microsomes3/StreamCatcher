const aws = require('aws-sdk');

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});
const sha256 = require('crypto-js/sha256');


const cloudformation = new aws.CloudFormation({
    region: process.env.AWS_REGION_T,
});


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

module.exports.handler = async (event) => {
    //request id from url
    const requestID = event.pathParameters.requestid;

    const IdHash = sha256(requestID).toString();

    const sname = "c"+IdHash;

  const params = {
    TableName: process.env.RECORD_REQUEST_TABLE,
    Key: {
        id: requestID
    }
    };

    const data = await documentWriter.get(params).promise();

    if (!data.Item) {
        return {
            statusCode: 404,
            headers:{
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: "Record not found!"
            }),
        }
    }

    const dsscribeStack = {
        StackName: sname
    };

    const stackDef = await cloudformation.describeStacks(dsscribeStack).promise();

    const ecsname = stackDef.$response.data.Stacks[0].Outputs[0].OutputValue;


    //ecs run task with ecsname task definition
    const ecs = new aws.ECS({
        region: process.env.AWS_REGION_T,
    });

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
                            value: requestID
                        },
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
        TableName: process.env.RecordStatusesTable,
        Item: {
            id: uuidv4(),
            recordrequestid: requestID,
            taskArn: taskArn,
            createdAt: new Date().getTime(),
        },
    };
    

    const dataStatuses = await documentWriter.put(paramsStatuses).promise();

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            dataStatuses,
            data:data,
            requestID:requestID,
            sname:sname,
            // stackDef:stackDef,
            ecsname:ecsname.split("/")[1].split(":1")[0],
            ecsdata:ecsdata
        }),
    }
};