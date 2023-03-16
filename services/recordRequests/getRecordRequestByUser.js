const aws  = require("aws-sdk");
const { getAllRequestsFromUser } = require("./helpers/rdrequestsHelper")

module.exports.handler = async (event) => {
  
    //get username from path
    const username = event.pathParameters.username;

    const data = await getAllRequestsFromUser(username);

  
    return {
        statusCode: 200,
        body: JSON.stringify({
            input: username,
            data,
        }),
    };

}