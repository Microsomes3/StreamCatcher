
const { spawn } = require('child_process');

function getLiveIndex(executablePath,url) {
    return new Promise((resolve, reject) => {
        var ls = spawn(executablePath, ['-f', 'bestvideo[height<=?1080][vcodec^=avc1]+bestaudio/best', '-g', url]);

        var indexCode = null;

        ls.stdout.on('data', (data) => {
            if(data.toString().length>20){
                indexCode = data.toString().split('\n')[0];
            }
        })

        ls.stderr.on('data', (data) => {
            // console.log(data);
        })

        ls.on('close', (code) => {
            console.log(code);
            resolve(indexCode);
        });
    })
}



module.exports = {
    getLiveIndex
}