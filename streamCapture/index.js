const { spawn } = require('child_process');

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

const { fetchComments, stopCapturingComments } = require('./helpers/scrapeComments')

var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');




const { exec } = require("child_process");

async function getVideoRuntime(filePath) {
    return new Promise((resolve, reject) => {
        try {
            ffprobe(filePath, { path: ffprobeStatic.path }, function (err, info) {
                if (err) resolve({
                    duration: 1,
                    storage: 1
                });

                try{
                const d = info.streams[0].duration
                const s = fs.statSync(filePath).size;
                resolve({
                    duration: d,
                    storage: s
                });
            }catch(e){
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

        const c = await axios.put("https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/UpdateProgress/"+process.env.RECORD_ID, {
            "currentRuntime": allRunetimes,
            "totalPartsRecorded": totalParts,
            "storageUsed": totalStorage,
            "totalTimeSoFar": allRunetimes
        })
        message = c.data.message;
    } catch (e) {
        console.log(e);
     }

    return {
        message: message
    }

}


function tryDownloadVIAFFMPEG(url, output, timeout, livetimeout, partNo) {
    console.log("trying to download", url, output, timeout, livetimeout, partNo)
    return new Promise((resolve, reject) => {
        const child = spawn('ffmpeg', ['-i', url,'-r','30', '-c', 'copy', output]);

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

            try{
            await postUpdateToAPI();
            }catch(e){}

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

function tryDownload2(timeout, videoId, parts, livetimeout, minruntime, stopCommentCapture) {
    return new Promise(async (resolve, reject) => {

        const newT = convertTimeoutTOMS(timeout);

        //i should record for partMin, then check if the stream is still live and if so, record again and swtich the file name

        for (var i = 0; i < parts; i++) {

            try {
                const indexData = await axios.post(process.env.getIndexapi + videoId);
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

        await stopCommentCapture();

        resolve({
            status: status,
            reason: reason,
            paths: paths
        })

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
    try {
      const { channel, timeout, bucket, region, parts, timeoutupdated, minruntime, isComments } = getAllRequiredInfoForTask();
      console.log({ channel, timeout, bucket, region, isComments })
  
      const isLive = await mustCheckLive(channel);
      if (isLive.status) {
        const videoId = isLive.link.split("?v=")[1];
        console.log("video id", videoId);
  
        const [downloadResult, comments] = await Promise.all([
          tryDownload2(timeout, videoId, parts, timeoutupdated, minruntime,stopCapturingComments),
          fetchComments({ url: "https://youtube.com/live_chat?is_popout=1&v=" + videoId })
        ]);

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
  
        const { paths, status, reason } = downloadResult;
  
        const allLocs = [];
        for (var i = 0; i < paths.length; i++) {
          const fileStream = fs.createReadStream(paths[i]);
          const d = moment().format("YYYY-MM-DD-HH-mm-ss");
  
          const uploadParams = {
            Bucket: bucket,
            Body: fileStream,
            ContentType: "video/mp4",
            Key: channel + "____part___" + i + "___" + d + ".mp4"
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
      }
  
      console.log(isLive)
    } catch (e) {
      console.log(e);
    } finally {
      console.log("done")
    }
  })();
  