const aws = require("aws-sdk");


const documentReader = new aws.DynamoDB.DocumentClient({
    region: "us-east-1"
});

const params = {
    TableName: "CallBackUrlsForLiveYoutubers",
    IndexName: 'username-index',
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
        ":username": "@griffingaming",
    },
};


(async ()=>{

    const result = await documentReader.query(params).promise();


    console.log(result);

})();