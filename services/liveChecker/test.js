
const aws = require('aws-sdk');

const ecs = new aws.ECS({
    region: "us-east-1",
});

const taskName = "cdf8178a034b13d4d36ee8691e3b4868a8d785d43a53a4a2a3ee989317cb762bd-ECSTask-3pX3L9FD1SVL";


const params = {
    cluster: "griffin-record-cluster",
    taskDefinition: taskName,
    launchType: "FARGATE",
    networkConfiguration: {
        awsvpcConfiguration: {
            subnets: [
                "subnet-035b7122",
            ],
            assignPublicIp: "ENABLED",
        
        }
    },
};

ecs.runTask(params).promise().then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});
