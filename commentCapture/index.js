const { spawn, exec } = require('child_process');

const moment = require("moment");
const axios = require("axios");
const fs = require("fs");
const aws = require("aws-sdk");
const { mustCheckLive } = require('./helpers/checkLive')
const { getAllRequiredInfoForTask } = require('./helpers/taskInfoHelper')
const { getYoutubeLiveUrl } = require('./helpers/getYoutubeLIveUrl')
const { fetchComments, stopCapturingComments } = require('./helpers/scrapeComments')
const { tryDownload } = require('./helpers/streamHelper')

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
        const { channel, timeout, bucket, region, parts, timeoutupdated, minruntime, isComments, isRecordStart, getIndexAPI,wssocket } = getAllRequiredInfoForTask();
        console.log({ channel, timeout, bucket, region, parts, timeoutupdated, minruntime, isComments, isRecordStart, getIndexAPI,wssocket})

        const isLive = await mustCheckLive(channel);
    
        if (isLive.status) {

           const liveLink= await getYoutubeLiveUrl(isLive.link);

            const videoId = liveLink.split("?v=")[1];
            console.log("video id", videoId);
            
            
            var isRecordFromStart = false;

            console.log(">>",isRecordStart)

            if(isRecordStart == "yes"){
                isRecordFromStart=true;
            }


            console.log("isRecordFromStart>", isRecordFromStart);
            

          
            const [downloadResult,downloadResult2, commentsP] = await Promise.all([
                isRecordFromStart == true ? tryDownload(channel,timeout,stopCapturingComments,"start",wssocket): ()=>{
                    return new Promise((resolve,reject)=>{
                        resolve()
                    })
                },
                isRecordFromStart== false ?tryDownload(channel,timeout,stopCapturingComments,"current",wssocket):() => {
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

            if (isRecordFromStart == true) {
                paths = downloadResult.paths;
                status = downloadResult.status;
                reason = downloadResult.reason;
                comments = downloadResult.comments;
            }else if(isRecordFromStart == false){
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

            try{
            const response = await axios.post(process.env.completionCallbackUrl, {
                requestId: process.env.RECORD_REQUEST_ID,
                keys: allLocs,
                status: {
                    status: "failed",
                    reason: process.env.channel+" is not live"
                },
                recordId: process.env.RECORD_ID,
            }, {
                timeout: 10000 // timeout after 10 seconds
            });
        }catch(err){}



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
