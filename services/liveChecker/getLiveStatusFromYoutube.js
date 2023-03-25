const { checkMultiLive } = require('./helpers/checkLive')



module.exports.handler = async (event, context, callback) => {

    const username = event.pathParameters.username;


    return {
        statusCode: 200,
        body: JSON.stringify({
            data: await checkMultiLive([username]),
            username: username,
        }),
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        }
    }
}