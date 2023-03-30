const { spawn, exec } = require('child_process');
const { convertTimeoutTOMS } = require('./dateHelper')
const fs = require('fs');

function tryDownload({ channel, timeout, mode = "start", wssocket }) {
    return new Promise((resolve, reject) => {
        try {
            const newT = convertTimeoutTOMS(timeout);
            console.log("will timeout in:", newT);
            const url = `https://www.youtube.com/${channel}/live`;

            var wsconnection = null;

            var allArgs = ['--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4', url]

            if (mode == "start") {
                allArgs.unshift("--live-from-start")
            }

            const child = spawn('yt-dlp', allArgs);

            child.stdout.on('data', (data) => {
                // console.log(`yt-dlp stdout: ${data}`);
            });

            child.stderr.on('data', (data) => {
                // console.error(`yt-dlp stderr: ${data}`);
            });

            try {

                //connect to websocket
                const WebSocket = require('ws');
                wsconnection = new WebSocket(wssocket);

                const interval = setInterval(function ping() {
                    wsconnection.ping();
                }, 30000);

                wsconnection.on('close', function close() {
                    console.log("disconnected from websocket");
                    clearInterval(interval);
                });

                wsconnection.on('open', function open() {
                    console.log("connected to websocket");

                    wsconnection.send(JSON.stringify({
                        "action": "registerreceiver",
                        "recordid": process.env.RECORD_ID
                    }));
                });

                wsconnection.on('message', function incoming(data) {
                    console.log(data);
                })



            } catch (e) { }

            setTimeout(() => {
                console.log('Sending SIGINT signal');
                child.kill('SIGINT');
            }, newT);

            child.on('exit', (code) => {
                console.log(`yt-dlp process exited with code ${code}`);

                //get .mp4 file
                const files = fs.readdirSync("./");
                const mp4 = files.filter(f => f.includes(".mp4"))[0];

                //disconnect from websocket
                if (wsconnection != null) {
                    wsconnection.close();
                }

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