
const { spawn } = require('child_process');

function getLiveStatusv2(executablePath,username) {
    const formattedUrl = username.includes("@") ? `https://youtube.com/${username}/live` : `https://twitch.tv/${username}/live`;
    return new Promise((resolve, reject) => {
        var ls = spawn(executablePath, ['-f', 'bestvideo[height<=?1080][vcodec^=avc1]+bestaudio/best', '-g', formattedUrl]);

        var indexCode = null;

        ls.stdout.on('data', (data) => {
            resolve(true);
        })

        ls.stderr.on('data', (data) => {
           resolve(false)
        })

        ls.on('close', (code) => {
            console.log(code);
            resolve(indexCode);
        });
    })
}


function getLiveIdv2(executablePath,username) {
    const formattedUrl = username.includes("@") ? `https://youtube.com/${username}/live` : `https://twitch.tv/${username}/live`;
    return new Promise((resolve, reject) => {
        // yt-dlp --print id  https://www.youtube.com/@ChillYourMind/live

        var ls = spawn(executablePath, ['--print', 'id', formattedUrl]);

        var indexCode = null;

        ls.stdout.on('data', (data) => {
            resolve(data.toString());
        })
    })
}


module.exports = {
    getLiveStatusv2,
    getLiveIdv2
}