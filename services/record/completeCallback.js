const aws = require('aws-sdk');
const moment = require("moment");

const documentClient = new aws.DynamoDB.DocumentClient(
    {
        region: process.env.AWS_REGION_T,
    }
);

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


module.exports.handler = async (event) => {

    const {
        requestId,
        keys,
        recordId,
        status,
    } = JSON.parse(event.body);

    if (!requestId || !keys || !recordId, !status) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required parameters',
            }),
        };
    }


    //inssert into dynamo
    const params = {
        TableName: process.env.RECORD_TABLE,
        Item: {
            id: recordId,
            recordrequestid:requestId,
            date: moment().format("YYYY-MM-DD"),
            keys: keys,
            username:"use request id to find out",
            createdAt: new Date().getTime(),
        },
    };

   

    var toE=null;

    try {
        toE= await documentClient.put(params).promise();
    } catch (err) {
        console.log(err);
    }


     //update recordStatuses

    const params2 = {
        TableName: process.env.RecordStatusesTable,
        Key: {
            id: recordId
        },
        UpdateExpression: "set #status = :s, #date = :d",
        ExpressionAttributeNames: {
            "#status": "status",
            "#date": "timeended" // add this line
        },
        ExpressionAttributeValues: {
            ":s": status,
            ":d": moment().unix() // add this line to set the date value to the current time in ISO format
        }
    };

    try {
        await documentClient.update(params2).promise();
    } catch (err) {
        console.log(err);
    }




    return {
        statusCode: 200,
        body: JSON.stringify({
           requestId,
           keys,
           toE
        }),
    }
};