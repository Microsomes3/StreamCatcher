
const { getLiveIndex } = require('./helpers/getLiveindex')

module.exports.handler = async (event) => {

    var username = event.pathParameters.username;
   
    const formattedUrl = `https://youtube.com/${username}/live`;
    const ex="/opt/yt-dlp_linux";
    const c = await getLiveIndex(ex, formattedUrl);

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
            index: c,
            url:formattedUrl
        })
    }
}