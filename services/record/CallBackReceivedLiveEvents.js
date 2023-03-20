const aws = require("aws-sdk");
const axios = require("axios");
const moment = require("moment");

const { getAllRequestsFromUser } = require("./helpers/rdrequestshelper")

const { makeRecordRequest } = require("./helpers/submitRecordingRequest");

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1",
});

module.exports.handler = async (event, context, callback) => {
    console.log("ll")
    
    try{
        const data = JSON.parse(event.body);
        console.log("?",data);

        const username = data.username;

        const allRequests = await getAllRequestsFromUser(username);

        const items = allRequests.Items || [];

        for(var i=0;i<items.length;i++){

            //check if live
            if(items[i].isLive == false){
                continue;
            }

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

            const rddata = await documentClient.query(params).promise();

            const fd = rddata.Items.filter((item)=>{
                return item.id == items[i].id
            })

            console.log(">fd", fd);

            //check if not found 
            if(fd.length == 0){
                //create new record

                try{

                const requestId= items[i].id

                const record= await makeRecordRequest({
                    requestId: requestId
                });
            
                const params = {
                    TableName: process.env.RecordAutoRecordTable,
                    Item: {
                        id: items[i].id,
                        date: current,
                        requestData: items[i],
                        recordrequestid: requestId,
                        record: record,
                        status: "pending",
                        created: moment().format("YYYY-MM-DD HH:mm:ss"),
                        updated: moment().format("YYYY-MM-DD HH:mm:ss")
                    }
                };

                await documentClient.put(params).promise();
            }catch(e){
                console.log(e);
            }
            }

            }catch(e){
                console.log(e);
            }
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