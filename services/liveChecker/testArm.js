const fs = require('fs');

const { getLiveStatusv2 } = require('./helpers/checkLivev2')

module.exports.handler = async (event, context, callback) => {

    //get all /opt files

    const files = fs.readdirSync('/opt');

    const isLive = await getLiveStatusv2('/opt/yt-dlp_linux_aarch64', '@GriffinGaming');

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello World",
            files: files,
            islive: isLive,
        }),
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        }
    }
}