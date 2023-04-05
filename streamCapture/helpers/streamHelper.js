const { spawn, exec } = require('child_process');
const { convertTimeoutTOMS } = require('./dateHelper')
const fs = require('fs');

function getLiveStatusv2(executablePath, url) {
    const formattedUrl = `${url}`;
    return new Promise((resolve, reject) => {
        var ls = spawn(executablePath, ['-f', 'bestvideo+bestaudio/best', '-g', formattedUrl]);

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

function checkIfStillOnline(url, childYTDLPProcess) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            const isLive = await getLiveStatusv2("yt-dlp", url)
            if (isLive == false) {
                childYTDLPProcess.kill('SIGINT');
                clearInterval(interval);
            }
            // your logic to check if the URL is still online goes here
        }, 1000 * 60 * 5); // check every 5 minutes

    });
}

function tryDownload({ channel, timeout, mode = "start", wssocket }) {
    return new Promise(async (resolve, reject) => {
        try {
            const newT = convertTimeoutTOMS(timeout);
            console.log("will timeout in:", newT);
            const url = `https://www.youtube.com/${channel}/live`;

            var ytDlpArgs = ['--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4', '--keep-video', url]

            if (mode == "start") {
                ytDlpArgs.unshift("--live-from-start")
            }

            var child = null;

            if (mode == "start") {
                child = spawn('yt-dlp', ytDlpArgs);
                console.log("from start")
            } else {
                child = spawn('yt-dlp', ytDlpArgs);
            }

            checkIfStillOnline(url, child)


            child.stdout.on('data', (data) => {
                console.log(`yt-dlp stdout: ${data}`);
            });

            child.stderr.on('data', (data) => {
                console.error(`yt-dlp stderr: ${data}`);
            });

            const backupTimer = setTimeout(() => {
                console.log('Sending SIGINT signal');
                child.kill('SIGINT');
            }, newT);

            child.on('exit', (code) => {
                console.log(`ffmpeg process exited with code ${code}`);
                clearTimeout(backupTimer);

                //get .mp4 file
                const files = fs.readdirSync("./");
                const mp4 = files.filter(f => f.includes(".mp4"));

                resolve({
                    status: "success",
                    reason: "success",
                    paths: [mp4],
                    comments: []
                })
            })
        } catch (e) {
            resolve({
                status: "failed",
                reason: e.message,
                paths: [],
                comments: []
            })
        }

    })
}
module.exports = {
    tryDownload
}