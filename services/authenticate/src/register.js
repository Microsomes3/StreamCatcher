
const { createDbUser } = require('./helpers/db');

module.exports.handler = async (event, context) => {
    const body = JSON.parse(event.body);

     await createDbUser(body);

    return {
        statusCode: 200,
        body: JSON.stringify({
        message: 'Authorized',
        input: event,
        // user,
        }),
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    };
}