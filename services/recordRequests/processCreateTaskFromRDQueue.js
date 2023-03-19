const aws = require('aws-sdk');

const fs = require('fs');

const sha256 = require('crypto-js/sha256');

const tasktml = fs.readFileSync('task.yml', 'utf8');

const cloudformation = new aws.CloudFormation({
    region: process.env.AWS_REGION_T,
});


module.exports.handler = async (event) => {
    //receive message from queue
    const {id, username, duration} = JSON.parse(event.Records[0].body);

    const IdHash = sha256(id).toString();

    const sname = "c"+IdHash;

    //create task definition
    const params = {
        StackName: sname,
        TemplateBody: tasktml,
        Capabilities: [
            "CAPABILITY_IAM",
            "CAPABILITY_NAMED_IAM",
        ],
        Parameters: [
            {
                ParameterKey: 'Name',
                ParameterValue: "c"+id,
            },
            {
                ParameterKey: 'Channel',
                ParameterValue: username,
            },
            {
                ParameterKey: 'Timeout',
                ParameterValue: duration+"s",
            },
        ],
    };

    const data = await cloudformation.createStack(params).promise();


    //get output from task definition ECSTASKName
    const params2 = {
        StackName: sname
    };

    const stackDef = await cloudformation.describeStacks(params2).promise();

    const ECSTASKName = stackDef.$response.data.Stacks[0].Outputs[0].OutputValue;

    //update record request table with ECSTASKName
    const documentClient = new aws.DynamoDB.DocumentClient({
        region: process.env.AWS_REGION_T,
    });

    const params3 = {
        TableName: process.env.RECORD_REQUEST_TABLE,
        Key: {
            id: id
        },
        UpdateExpression: "set ecstask = :e",
        ExpressionAttributeValues:{
            ":e":ECSTASKName
        },
        ReturnValues:"UPDATED_NEW"
    };

    //send update to record request table

    documentClient.update(params3, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });


    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({
            input: params,
            data,
        }),
    }
}