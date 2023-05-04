const { signInUser, getUser } = require("./helpers/db")

module.exports.handler = async (event, context) => {

    try{
    const body = JSON.parse(event.body);

    const token = await signInUser(body.email,body.password);

    const user = await getUser(body.email);

    return {
        statusCode: 200,
        body: JSON.stringify({
        message: 'Authorized',
        token:token,
        user
        }),
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    };
}catch(e){
    return {
        statusCode: 401,
        body: JSON.stringify({
        message: e.message,
        }),
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    };
}
}