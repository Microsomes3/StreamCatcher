const aws = require('aws-sdk');

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
    const {username, duration, from, to, callback} = JSON.parse(event.body);

    if (!username || !duration || !from || !to || !callback) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required parameters',
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
            callback,
            ecstask: null,
        },
    };

    const data = await documentClient.put(params).promise();



    return {
        statusCode: 200,
        body: JSON.stringify({
            input: params,
            data,
        }),
    };

}