const aws = require("aws-sdk");
const axios = require("axios");

const { getAllRequestsFromUser } = require("./helpers/rdrequestshelper")

module.exports.handler = async (event, context, callback) => {
    console.log("ll")
    
    try{
        const data = JSON.parse(event.body);
        console.log("?",data);

        const username = data.username;

        const allRequests = await getAllRequestsFromUser(username);

        console.log(allRequests);

    }catch(e){
        console.log(e);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda",
            input: event
        })
    }
}