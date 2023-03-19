const aws = require('aws-sdk');


module.exports.handler = async (event) => {

    const {
        requestId,
        key 
    } = JSON.parse(event.body);

    if (!requestId || !key) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required parameters',
            }),
        };
    }


    return {
        statusCode: 200,
        body: JSON.stringify({
           requestId,
           key
        }),
    }
};