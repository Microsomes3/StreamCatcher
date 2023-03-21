const aws = require("aws-sdk");
const axios = require("axios");
const moment = require("moment");

const { getAllRequestsFromUser } = require("./helpers/rdrequestshelper")

const { makeRecordRequest } = require("./helpers/submitRecordingRequest");

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1",
});


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports.handler = async (event, context, callback) => {
    console.log("ll")
    
    try{
        const data = JSON.parse(event.body);
        console.log("?",data);

        const username = data.username;

      

    }catch(e){
        console.log(e);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda",
            input: event
        })
    }
}