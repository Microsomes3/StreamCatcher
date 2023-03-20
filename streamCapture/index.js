
const { spawn } = require('child_process');

const moment = require("moment");

const axios = require("axios");

const { checkLIVE } = require('./checkLive.js');

const fs = require("fs");

const aws = require("aws-sdk");

const { createLogWithStream } = require("./logs.js")

const path = require("path");


function mustCheckLive(channel) {

    const getChannelStatusURI = process.env.getChannelStatusURI || "https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatus/";

    return new Promise(async (resolve, reject) => {
        var maxTries = 3;
        var currentTry = 0;

        var toReturn = false;

        for (var i = 0; i < maxTries; i++) {

            try {
                const isLive = await axios.get(getChannelStatusURI + channel);
                toReturn = isLive.data;
                break;
            } catch (e) {
                console.log(e);
            }

            currentTry++;

        }

        resolve(toReturn)


    })
}

function tryDownload(timeout, link) {
    return new Promise((resolve, reject) => {
        const child = spawn('timeout', ['-s', 'INT', timeout, 'yt-dlp', '--live-from-start', link, '-o', 'output.mp4', '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4']);

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            // reject(data);
        });

        child.on('close', (code) => {
            resolve(code);
        });

    })
}


function tryDownloadVIAFFMPEG(url, output, timeout) {
    return new Promise((resolve, reject) => {
        const child = spawn('ffmpeg', ['-i', url, '-c', 'copy', output]);

        //create videos folder if it doesn't exist
        if (!fs.existsSync("videos")) {
            fs.mkdirSync("videos");
        }


        console.log("timeout", timeout)

        const timeoutId = setTimeout(() => {
            console.log('Timeout exceeded, stopping ffmpeg...');
            child.kill('SIGINT');
        }, timeout);

        child.on('exit', (code) => {
            clearTimeout(timeoutId);
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

function stichTogether(videos) {
    return new Promise((resolve, reject) => {

        console.log("stiching together", videos);

        const path = require('path');

        const visibleVideos = videos.filter((v) => {
            const fileName = path.basename(v);
            return !fileName.startsWith('.');
        });

        const paths = visibleVideos.map((v) => `file 'videos/${v}'`);
        fs.writeFileSync("concat.txt", paths.join("\n"));

        const child = spawn('ffmpeg', ['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', 'videos/output.mp4']);

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        })

        child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        })

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve(code);
        });

    });
}

function convertTimeoutTOMS(timeout) {

    //example input 60s or 60m or 60h

    const time = timeout.substring(0, timeout.length - 1);
    const unit = timeout.substring(timeout.length - 1);

    if (unit === "s") {
        return time * 1000;
    }

    if (unit === "m") {
        return time * 1000 * 60;
    }

    if (unit === "h") {
        return time * 1000 * 60 * 60;
    }

}

function tryDownload2(timeout, videoId, parts) {
    return new Promise(async (resolve, reject) => {

        const newT = convertTimeoutTOMS(timeout);

        //i should record for partMin, then check if the stream is still live and if so, record again and swtich the file name

        for (var i = 0; i < parts; i++) {
            const indexData = await axios.post("https://aov1nrki8l.execute-api.us-east-1.amazonaws.com/dev/getLiveIndex/" + videoId);
            const indexUrl = indexData.data.index;
            await tryDownloadVIAFFMPEG(indexUrl, `videos/output_${i}pt.mp4`, newT);
        }

        const videos = fs.readdirSync("videos");

        const visibleVideos = videos.filter((v) => {
            const fileName = path.basename(v);
            return !fileName.startsWith('.');
        });
        const paths = visibleVideos.map((v) => `videos/${v}`);

        resolve(paths);
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

    const channel = process.env.channel || "@CreepsMcPasta";
    const timeout = process.env.timeout || "60s";
    const bucket = process.env.bucket || "griffin-record-input";
    const region = process.env.region || "us-east-1";
    const parts = process.env.parts || 1;

    console.log({
        channel,
        timeout,
        bucket,
        region
    })


    mustCheckLive(channel).then(async (isLive) => {

        if (isLive.status) {
            //
            const videoId = isLive.link.split("?v=")[1];

            console.log("video id", videoId);

            // await tryDownload(timeout, "https://youtube.com" + isLive.link);

            const paths = await tryDownload2(timeout, videoId, parts);

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

            try {
                const response = await axios.post(process.env.completionCallbackUrl, {
                    requestId: process.env.RECORD_REQUEST_ID,
                    keys: allLocs,
                    recordId: process.env.RECORD_ID,
                }, {
                    timeout: 10000 // timeout after 10 seconds
                });

                console.log("callback response", response.data);
            }catch(e){}
        } else {
            console.log("NOT LIVE");
        }
    });


})()

