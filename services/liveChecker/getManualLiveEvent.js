const aws = require("aws-sdk");
const moment = require("moment");
const axios = require("axios");



function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});



module.exports.handler = async (event) => {
   const username = event.pathParameters.username;

   const data = JSON.parse(event.body);

   const l = data.result[0]
   
   console.log(l);



const params = {
    TableName: process.env.LIVE_CHECKER_TABLE,
    Item: {
        id: uuidv4(),
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
        channel: l.username,
        status: JSON.stringify(l),
        isLive: l.isLive,
        liveLink: l.liveLink,
    },
};

const cc = await documentWriter.put(params).promise();

console.log(cc);

   return {
         statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                results: username,
                data: data, 
                l: l
            }),
   }
}