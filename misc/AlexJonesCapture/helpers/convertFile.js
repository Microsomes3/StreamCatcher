const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');


function convertFile(path, output) {
    return new Promise((resolve, reject) => {

        console.log("converting file")

        ffmpeg(path)
            .output(output)
            .on('end', function () {
                console.log('conversion ended');

                //rm file

                fs.unlinkSync(path);

                resolve()
            }).run();

    })
}

module.exports = {
    convertFile
}