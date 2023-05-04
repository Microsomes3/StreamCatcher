const {
    getUserFromToken
} = require("./helpers/db")

module.exports.handler = async (event, context) => {

    console.log(event);

    try{
    const user = await getUserFromToken(event.headers.Authorization)

    return {
        statusCode: 200,
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
        message: 'Authorized',
        input: event.headers.Authorization,
        user
        }),
    }
}catch(err){
    return {
        statusCode: 401,
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
        message: err.message,
        }),
    }
}
}