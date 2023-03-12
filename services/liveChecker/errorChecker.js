const aws = require("aws-sdk");

const documentReader = new aws.DynamoDB.DocumentClient({
    region:process.env.AWS_REGION_T
});