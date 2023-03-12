const aws = require("aws-sdk");
const { getAllCallbacks } = require("./helpers/getAllCallbacks.js");


module.exports.getCallbacksByUsername = async (event) => {

    try {
        const username = event.queryStringParameters.user;

        const result = await getAllCallbacks(username);
      
        return {
            statusCode: 200,
            body: result
        }
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing username",
                event: event,
                error: e,
            }),
        }
    }


}