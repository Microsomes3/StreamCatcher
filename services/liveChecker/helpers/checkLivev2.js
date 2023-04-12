
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



module.exports = {
    getLiveStatusv2
}