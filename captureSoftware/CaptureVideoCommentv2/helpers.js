const {spawn} = require('child_process');


function getVideoId(username){
    return new Promise((resolve,reject)=>{
        const youtubeUrl = "https://youtube.com/"+username+"/live";

        //yt-dlp

        const ytdlp = spawn('yt-dlp', [youtubeUrl, '--get-id']);

        ytdlp.stdout.on('data', (data) => {
            resolve(data.toString());
        })

        ytdlp.stderr.on('data', (data) => {
            resolve("")
        })
    })
}


module.exports = {
    getVideoId
}