
module.exports.callbackGriffinLive = async (event) => {

    console.log("griffin is live")

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }),
    }
};