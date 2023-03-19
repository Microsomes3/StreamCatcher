const aws = require('aws-sdk');

const cloudformation = new aws.CloudFormation({
    region: "us-east-1",
});

const stackname = "c5774eeecde560db41adba2fb772cf4163fd44327b0428c38155bd8310e65e3a8";

const params = {
    StackName: stackname,
};

cloudformation.describeStacks(params).promise().then((data) => {
    console.log(data.$response.data.Stacks[0].Outputs[0].OutputValue);
}).catch((err) => {
    console.log(err);
});