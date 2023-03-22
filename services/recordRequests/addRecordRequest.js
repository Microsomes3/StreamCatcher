const aws = require('aws-sdk');
const moment = require('moment');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T,
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


module.exports.handler = async (event) => {
    const {username, duration, from, to, trigger, maxparts, minruntime} = JSON.parse(event.body);

    if (!username || !duration || !from || !to || !trigger, !maxparts || !minruntime) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required parameters',
                expected:[
                    "username",
                    "duration",
                    "from",
                    "to",
                    "trigger",
                    "maxparts",
                    "minruntime",
                ]
            }),
        };
    }
    

    const maxExpectedRuntime = duration* maxparts;

    if(minruntime > maxExpectedRuntime){
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'minruntime is greater than maxExpectedRuntime',
                expectedRuntime:maxExpectedRuntime,
            }),
        };
    }

    //check of duration is a number maxparts and ninruntime are numbers

    if (isNaN(duration) || isNaN(maxparts) || isNaN(minruntime)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be numbers',
            }),
        };
    }

    //check if duration is a positive number

    if (duration <= 0 || maxparts <= 0 || minruntime <= 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be positive numbers',
            }),
        };
    }

    //check if duration is a whole number

    if (duration % 1 !== 0 || maxparts % 1 !== 0 || minruntime % 1 !== 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration, maxparts and minruntime must be whole numbers',
            }),
        };
    }

    //check if duration is less than 24 hours (in seconds)

    if (duration > 86400) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'duration must be less than 24 hours',
            }),
        };
    }




    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE,
        Item: {
            id: uuidv4(),
            username,
            duration,
            from,
            to,
            trigger,
            maxparts,
            minruntime,
            createdAt: moment().unix(),
            friendlyCreatedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
        },
    };

    const data = await documentClient.put(params).promise();
    
    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            input: params,
            data,
        }),
    };

}