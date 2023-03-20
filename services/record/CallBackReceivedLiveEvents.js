const aws = require("aws-sdk");
const axios = require("axios");
const moment = require("moment");

const { getAllRequestsFromUser } = require("./helpers/rdrequestshelper")

module.exports.handler = async (event, context, callback) => {
    console.log("ll")
    
    try{
        const data = JSON.parse(event.body);
        console.log("?",data);

        const username = data.username;

        const allRequests = await getAllRequestsFromUser(username);

        const items = allRequests.Items || [];

        for(var i=0;i<items.length;i++){
            try{
            console.log("trigger>", items[i].trigger);

            const current = moment().format("YYYY-MM-DD");

            const params = {
                TableName: process.env.RecordAutoRecordTable,
                IndexName: "date-index",
                KeyConditionExpression: "#dt = :date",
                ExpressionAttributeNames: {
                    "#dt": "date"
                },
                ExpressionAttributeValues: {
                    ":date": current,
                },
            };

            
            console.log(params);

            
            }catch(e){}
        }


        console.log(allRequests);

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