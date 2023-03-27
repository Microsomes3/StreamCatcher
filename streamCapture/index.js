const { spawn, exec } = require('child_process');

const util = require('util');
const moment = require("moment");
const axios = require("axios");
const fs = require("fs");
const aws = require("aws-sdk");
const path = require("path");
const { convertTimeoutTOMS } = require('./helpers/dateHelper')
// const { getVideoRuntime } = require('./helpers/CalculateRuntimeHelper')
const { mustCheckLive } = require('./helpers/checkLive')
const { getAllRequiredInfoForTask } = require('./helpers/taskInfoHelper')
const { getYoutubeLiveUrl } = require('./helpers/getYoutubeLIveUrl')
const { fetchComments, stopCapturingComments } = require('./helpers/scrapeComments')

var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

const xvfbProcess = spawn("Xvfb", [":99", "-screen", "0", "1024x768x16"]);
xvfbProcess.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});
xvfbProcess.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});
xvfbProcess.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

async function getVideoRuntime(filePath) {
    return new Promise((resolve, reject) => {
        try {
            ffprobe(filePath, { path: ffprobeStatic.path }, function (err, info) {
                if (err) resolve({
                    duration: 1,
                    storage: 1
                });

                try {
                    const d = info.streams[0].duration
                    const s = fs.statSync(filePath).size;
                    resolve({
                        duration: d,
                        storage: s
                    });
                } catch (e) {
                    resolve({
                        duration: 1,
                        storage: 1
                    });
                }
            });
        } catch (error) {
            resolve({
                duration: 1,
                storage: 1
            });
        }
    })

}

async function postUpdateToAPI() {

    //check videos directory

    var doesVidesoDirExist = fs.existsSync("videos");

    var totalParts = 0;
    var totalStorage = 0;
    var allRunetimes = 0;


    if (doesVidesoDirExist) {

        totalParts = fs.readdirSync("videos").length;

        const paths = fs.readdirSync("videos").map((f) => {
            return path.join("videos", f);
        })

        console.log(paths);


        for (var i = 0; i < paths.length; i++) {
            const r = await getVideoRuntime(paths[i]);
            allRunetimes += parseFloat(r.duration);
            totalStorage += r.storage;

        }

    }

    var message = "oo";

    try {

        const c = await axios.put(process.env.recordUpdateApi + "/" + process.env.RECORD_ID, {
            "currentRuntime": allRunetimes,
            "totalPartsRecorded": totalParts,
            "storageUsed": totalStorage,
            "totalTimeSoFar": allRunetimes
        })
        message = c.data.message;
    } catch (e) {
    }

    return {
        message: message
    }

}


function tryDownloadVIAFFMPEG(url, output, timeout, livetimeout, partNo) {
    console.log("trying to download", url, output, timeout, livetimeout, partNo)
    return new Promise((resolve, reject) => {
        const child = spawn('ffmpeg', ['-i', url, '-r', '30', '-c', 'copy', output]);

        //create videos folder if it doesn't exist
        if (!fs.existsSync("videos")) {
            fs.mkdirSync("videos");
        }


        const checkLastFileAdded = setInterval(() => {
            console.log("checking for new file")

            try {
                //get details of output file
                const o = fs.statSync(output);

                //check difference between last modified and now
                const now = moment().unix();
                const lastUpdatedFile = moment(o.mtime).unix();

                const diff = now - lastUpdatedFile;


                if (diff > livetimeout) {
                    console.log("stream is no longer live, stopping ffmpeg")
                    child.kill('SIGINT');
                    clearInterval(checkLastFileAdded);
                } else {
                    console.log("stream is still live, continuing", diff)
                }

            } catch (e) {
            }

        }, 1000)

        const timeoutId = setTimeout(() => {
            console.log('Timeout exceeded, stopping ffmpeg...');
            child.kill('SIGINT');
        }, timeout);


        var updateTimeout = 60000 * 5; // 5 minutes

        const progressUpdate = setInterval(async () => {
            const r = await postUpdateToAPI()
            console.log(r);
        }, updateTimeout);


        child.on('exit', async (code) => {
            clearTimeout(timeoutId);
            clearInterval(checkLastFileAdded);

            try {
                await postUpdateToAPI();
            } catch (e) { }

            clearInterval(progressUpdate);


            if (code === 0) {
                console.log('Download complete');
                resolve();
            } else {
                // reject(`FFMPEG exited with code ${code}`);
                resolve();
            }
        });

        child.stderr.on('data', (data) => {
            // console.log(`stderr: ${data}`);
        });

        child.stdout.on('data', (data) => {
            // console.log(`stdout: ${data}`);
        });
    });
}

function tryDownload2(timeout, videoId, parts, livetimeout, minruntime, stopCommentCapture,getIndexAPI, channel) {
    return new Promise(async (resolve, reject) => {

        const newT = convertTimeoutTOMS(timeout);

        //i should record for partMin, then check if the stream is still live and if so, record again and swtich the file name

        for (var i = 0; i < parts; i++) {

            try {
                const indexData = await axios.post(getIndexAPI + "/" + channel);
                const indexUrl = indexData.data.index;
                const c = await tryDownloadVIAFFMPEG(indexUrl, `videos/output_${i}pt.mp4`, newT, livetimeout, i);
            } catch (e) {
                console.log("moving on");
                console.log(e);
            }
        }

        const videos = fs.readdirSync("videos");

        const visibleVideos = videos.filter((v) => {
            const fileName = path.basename(v);
            return !fileName.startsWith('.');
        });
        const paths = visibleVideos.map((v) => `videos/${v}`);

        var allRunetimes = 0;

        for (var i = 0; i < paths.length; i++) {
            const runtime = await getVideoRuntime(paths[i]).duration;
            allRunetimes += runtime;
        }

        var status = "";
        var reason = "";


        if (allRunetimes < minruntime) {
            console.log("not enough runtime, trying again");
            status = "failed";
            reason = "not enough runtime";
        } else {
            status = "success";
            reason = "success";
        }

       const comments = await stopCommentCapture();

        resolve({
            status: status,
            reason: reason,
            paths: paths,
            comments: comments.allComments
        })

    })
}

function tryDownloadStart(channel,timeout,livetimeout,stopCapturingComments){
    return new Promise((resolve,reject)=>{
        const newT = convertTimeoutTOMS(timeout);

        //if videos folder doesn't exist, create it
        if(!fs.existsSync("videos")){
            fs.mkdirSync("videos");
        }

        const url = `https://www.youtube.com/${channel}/live`;


        const outputFolder = 'videos';
        const ytldCommand = `yt-dlp --live-from-start -o ./${outputFolder}/%(title)s.%(ext)s" --merge-output-format mp4 ${url}`;


        const child = spawn('yt-dlp', ytldCommand.split(' '), {
            detached: true,
            stdio: 'inherit'
          });
          
          child.on('exit', async (code) => {
            console.log(`yt-dlp process exited with code ${code}`);
            
            stopCapturingComments().then((comments)=>{
                


            //get all mp4 files in videos folder

            const videos = fs.readdirSync("videos");

            const visibleVideos = videos.filter((v) => {
                const fileName = path.basename(v);
                return !fileName.startsWith('.');
            });

            const paths = visibleVideos.map((v) => `videos/${v}`);

        
            resolve({
                status: "success",
                reason: "success",
                paths: paths,
                comments: comments.allComments
            })

            })

          });
          
          const timeoutId = setTimeout(() => {
            console.log('Timeout exceeded, stopping yt-dlp...');
            process.kill(child.pid, 'SIGINT');
          }, newT);

          




    })
}

function manageUploadST(params, region) {
    return new Promise((resolve, reject) => {
        const s3 = new aws.S3({
            region: region
        });

        const managedUpload = s3.upload(params);

        managedUpload.on('httpUploadProgress', function (progress) {
            console.log("Progress: " + progress.loaded + " / " + progress.total);
        });

        managedUpload.send(function (err, data) {

            if (err) {
                console.log("Error", err);
                reject(err);
            }

            if (data) {
                console.log("Upload Success", data.Location);
                resolve(data.Key);
            }

        });

    })
}

(async () => {

    //create videos folder if it doesn't exist
    if (!fs.existsSync("videos")) {
        fs.mkdirSync("videos");
    }

    try {
        const { channel, timeout, bucket, region, parts, timeoutupdated, minruntime, isComments, isRecordStart, getIndexAPI } = getAllRequiredInfoForTask();
        console.log({ channel, timeout, bucket, region, isComments })

        const isLive = await mustCheckLive(channel);

    
        if (isLive.status) {

           const liveLink= await getYoutubeLiveUrl(isLive.link);

            const videoId = liveLink.split("?v=")[1];
            console.log("video id", videoId);

            const [downloadResult,downloadResult2, commentsP] = await Promise.all([
                isRecordStart == "yes" ? tryDownloadStart(channel,timeout,timeoutupdated,stopCapturingComments): ()=>{
                    return new Promise((resolve,reject)=>{
                        resolve()
                    })
                },
                isRecordStart == "no" ?tryDownload2(timeout, videoId, parts, timeoutupdated, minruntime, stopCapturingComments, getIndexAPI, channel):() => {
                    return new Promise((resolve, reject) => {
                        resolve()
                    })
                },
                isComments == "yes" ? fetchComments({ url: "https://youtube.com/live_chat?is_popout=1&v=" + videoId }) : () => {
                    return new Promise((resolve, reject) => {
                        resolve()
                    })
                }
            ]);

            var paths = []
            var status = ""
            var reason = ""
            var comments = []

            if (isRecordStart == "yes") {
                paths = downloadResult.paths;
                status = downloadResult.status;
                reason = downloadResult.reason;
                comments = downloadResult.comments;
            }else if(isRecordStart == "no"){
                paths = downloadResult2.paths;
                status = downloadResult2.status;
                reason = downloadResult2.reason;
                comments = downloadResult2.comments;
            }
            

            if (isComments == "yes") {

                console.log(">>", comments);

                try{

                //upload comments
                fs.writeFileSync("comments_g.json", JSON.stringify(comments));
                const fileStream = fs.createReadStream("comments_g.json");
                const d = moment().format("YYYY-MM-DD-HH-mm-ss");
                const uploadParams = {
                    Bucket: bucket,
                    Body: fileStream,
                    ContentType: "application/json",
                    Key: process.env.RECORD_ID + "____comments___" + d + ".json"
                };

                const loc = await manageUploadST(uploadParams, region);

                console.log("comments uploaded", loc);
            }catch(e){}
            }


            const allLocs = [];
            for (var i = 0; i < paths.length; i++) {
                const fileStream = fs.createReadStream(paths[i]);
                const d = moment().format("YYYY-MM-DD-HH-mm-ss");

                const uploadParams = {
                    Bucket: bucket,
                    Body: fileStream,
                    ContentType: "video/mp4",
                    Key: process.env.RECORD_ID+"_"+channel + "____part___" + i + "___" + d + ".mp4"
                };

                const loc = await manageUploadST(uploadParams, region);
                allLocs.push(loc);
            }

            console.log("send callback");
            console.log(allLocs);
            console.log("status", status);
            console.log("reason", reason);

            try {
                const response = await axios.post(process.env.completionCallbackUrl, {
                    requestId: process.env.RECORD_REQUEST_ID,
                    keys: allLocs,
                    status: {
                        status: status,
                        reason: reason
                    },
                    recordId: process.env.RECORD_ID,
                }, {
                    timeout: 10000 // timeout after 10 seconds
                });

                console.log("callback response", response.data);
            } catch (e) { }
        } else {
            console.log("NOT LIVE");
            //kill
            process.exit(0);
        }

        console.log(isLive)
    } catch (e) {
        console.log(e);
    } finally {
        console.log("done")
        process.exit(0);
    }
})();
