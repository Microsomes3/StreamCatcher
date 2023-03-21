const aws  = require("aws-sdk");
const { getAllRequestsFromUser } = require("./helpers/rdrequestsHelper")

module.exports.handler = async (event) => {
  
    //get username from path
    const username = event.pathParameters.username;

    const data = await getAllRequestsFromUser(username);

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            input: username,
            data,
        }),
    };

}