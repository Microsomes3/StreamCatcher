const { makeRecordRequest } = require('./helpers/submitRecordingRequest')
const moment = require('moment');
const aws = require('aws-sdk');
const current = moment().format("YYYY-MM-DD");

makeRecordRequest({
    requestId:'cec227ba-ae07-4bdf-bffd-73ef13c9ab0a'
}).then((d)=>{
    console.log(d);

    const params = {
        TableName: process.env.RecordAutoRecordTable || "RecordAutoRecordTable",
        Item: {
            id: 'cec227ba-ae07-4bdf-bffd-73ef13c9ab0a',
            date: current,
            trigger: ";;",
            requestData: "ll",
            recordrequestid: "cec227ba-ae07-4bdf-bffd-73ef13c9ab0a",
            status: "pending",
            created: moment().format("YYYY-MM-DD HH:mm:ss"),
            updated: moment().format("YYYY-MM-DD HH:mm:ss")
        }
    };

    const documentClient = new aws.DynamoDB.DocumentClient({
        region: process.env.AWS_REGION_T || 'us-east-1',
    });


    documentClient.put(params).promise().then((d)=>{
        console.log(d);
    }
    ).catch((e)=>{
        console.log(e);
    }
    );


}).catch((e)=>{
    console.log(e);
});