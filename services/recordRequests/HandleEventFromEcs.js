const aws = require("aws-sdk");


module.exports.handler = async (event) => {
    //event coming from ecs eventrole

    console.log(event);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda",
        }),
    };
};