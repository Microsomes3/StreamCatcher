
const {spawn} = require('child_process');


function generateThumbnail(path, output){
    return new Promise((resolve, reject) => {

        try{

       const ffmpeg = spawn('ffmpeg', [
            '-i', path,
            '-ss', '00:00:01.000',
            '-vframes', '1',
            output
        ]);

        ffmpeg.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ffmpeg.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        
        ffmpeg.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve()
        });
    }catch(e){
        resolve()
    }

    })
}


module.exports= {
    generateThumbnail
}