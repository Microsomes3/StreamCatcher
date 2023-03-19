const aws = require('aws-sdk');


module.exports.handler = async (event) => {

    const body = JSON.parse(event.body);

    console.log(body);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Lambda',
        }),
    }
};