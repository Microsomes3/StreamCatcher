const { spawn, exec } = require('child_process');
const { convertTimeoutTOMS } = require('./dateHelper')

function tryDownload(channel,timeout,stopCapturingComments,mode="start",wssocket){
    return new Promise((resolve,reject)=>{
        try{
        const newT = convertTimeoutTOMS(timeout);
        console.log("will timeout in:", newT);
        const url = `https://www.youtube.com/${channel}/live`;
        const outputFile = "output5.mp4";

        var allArgs = ['--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4', '-o', outputFile, url]

        if(mode == "start"){
            allArgs.unshift("--live-from-start")
        }

        const child = spawn('yt-dlp', allArgs);

        child.stdout.on('data', (data) => {
            // console.log(`yt-dlp stdout: ${data}`);
            });

        child.stderr.on('data', (data) => {
            // console.error(`yt-dlp stderr: ${data}`);
            });

            // try{

            //     //connect to websocket
            //     const WebSocket = require('ws');
            //     const ws = new WebSocket(wssocket);

            //     const interval = setInterval(function ping() {
            //         ws.ping();
            //     }, 30000);

            //     ws.on('close', function close() {
            //         console.log("disconnected from websocket");
            //         clearInterval(interval);
            //     });

            //     ws.on('open', function open() {
            //         console.log("connected to websocket");

            //         ws.send(JSON.stringify({
            //             "action":"registerreceiver",
            //             "recordid": process.env.RECORD_ID
            //         }));
            //     });

            //     ws.on('message', function incoming(data) {
            //         console.log(data);
            //     })



            // }catch(e){}


        
        setTimeout(() => {
            console.log('Sending SIGINT signal');
            child.kill('SIGINT');
          }, newT);

          child.on('exit', (code) => {
            console.log(`yt-dlp process exited with code ${code}`);

            stopCapturingComments().then((comments)=>{
                        resolve({
                            status: "success",
                            reason: "success",
                            paths: [ outputFile ],
                            comments: comments.allComments
                        })
                    })
          })
        }catch(e){
            resolve({
                status:"failed",
                reason: e.message,
                paths:[],
                comments:[]
            })
        }
       

    })
}







module.exports = {
    tryDownload
}