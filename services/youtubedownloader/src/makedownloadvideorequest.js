

module.exports.handler = async (event) => {
    const youtubeurl = event.queryStringParameters.youtubeurl;

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello ${youtubeurl}!`,
        }),
    };
};