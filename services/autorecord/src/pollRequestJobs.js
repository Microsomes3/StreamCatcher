const aws = require('aws-sdk');


module.exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            results: [],
        }),
    }
}