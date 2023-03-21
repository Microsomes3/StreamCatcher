const aws = require('aws-sdk');

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
        UpdateExpression: "set #status = :s",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":s": status
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