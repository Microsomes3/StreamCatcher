const axios = require('axios');
const { spawn } = require('child_process');

function mustCheckLive(channel) {
    return new Promise((resolve, reject) => {

        const url = `https://www.youtube.com/${channel}/live`;

        var ls = spawn("yt-dlp", ['-f', 'bestvideo[height<=?1080][vcodec^=avc1]+bestaudio/best', '-g', url]);

        ls.stdout.on('data', (data) => {
            resolve(true);
        })

        ls.stderr.on('data', (data) => {
            resolve(false)
        })
    })
}

module.exports = {
    mustCheckLive
}