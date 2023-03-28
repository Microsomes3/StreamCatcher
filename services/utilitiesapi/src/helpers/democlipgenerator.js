
const { getLiveStatus } = require('./getLiveindex')
const fs = require('fs');
const { spawn, exec } = require('child_process');

function makeDemoClip(username){
return new Promise(async (resolve,reject)=>{

    const formaturl="https://youtube.com/"+username+"/live";
   
    var ex="/opt/yt-dlp_linux";

    const islive = await getLiveStatus(ex,formaturl);

    const outputFolder = "/tmp/videos";

    const ffmpeglocation = "./ffmpeg"

    const ytldCommand = `-o ${outputFolder}/%(title)s.%(ext)s" --ffmpeg-location ${ffmpeglocation} ${formaturl}`;


    if(!islive){
        reject("not live")
    }

    const child = spawn(ex, ytldCommand.split(' '), {
        detached: true,
        stdio: 'inherit'
    });


    child.on('exit', (code, signal) => {
        console.log(`child process exited with code ${code} and signal ${signal}`);

        //get mp4 file in videos
        const files = fs.readdirSync(outputFolder);
        const mp4files = files.filter((f)=>{
            return f.includes(".mp4");
        })


        resolve(mp4files[0]);

    });


    setTimeout(()=>{
        //kill
        child.kill('SIGINT');

    },15000)



})
}



module.exports = {
    makeDemoClip
}

