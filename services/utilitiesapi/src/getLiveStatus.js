const { getLiveStatus } = require('./helpers/getLiveindex')


module.exports.handler = async (event) => {
    const username = event.pathParameters.username;

    const ex="/opt/yt-dlp_linux";
    const formattedUrl =`https://www.youtube.com/${username}/live`;
    const c = await getLiveStatus(ex, formattedUrl);


    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
            isLive: c,
            link:formattedUrl
        })

    }


}