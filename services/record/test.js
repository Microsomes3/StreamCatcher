const aws = require('aws-sdk');

const moment = require('moment');


const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});


const table = "RecordAutoRecordTable";


(async()=>{

    console.log("Starting...");

    const currentDate = moment().format("YYYY-MM-DD");
    
    console.log("current",currentDate);

    //search by date
    const params = {
        TableName: table,
        IndexName: "date-index",
        KeyConditionExpression: "#dt = :date",
        ExpressionAttributeNames: {
            "#dt": "date"
        },
        ExpressionAttributeValues: {
            ":date": currentDate,
        },
    };

    const data = await documentClient.query(params).promise();


    const fd = data.Items.filter((item)=>{
        return item.id == '33'
    })

    console.log(fd);
    

})();