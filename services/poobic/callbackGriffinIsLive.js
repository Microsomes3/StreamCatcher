
module.exports.handler = async (event) => {

    console.log("griffin is live")

    const body = JSON.parse(event.body);

    console.log(body);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }),
    }
};