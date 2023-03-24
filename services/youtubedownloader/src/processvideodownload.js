

module.exports.handler = async (event) => {

    const queueMessage = JSON.parse(event.Records[0].body);

    console.log(queueMessage);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello ${youtubeurl}!`,
        }),
    };
}
