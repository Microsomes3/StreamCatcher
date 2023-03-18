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

    //create task definition
    const params = {
        StackName: "c"+IdHash,
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