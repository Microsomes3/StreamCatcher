
const { spawn } = require('child_process');

const moment = require("moment");

const axios = require("axios");

const { checkLIVE } = require('./checkLive.js');

const fs = require("fs");

const aws = require("aws-sdk");

const { createLogWithStream } = require("./logs.js")


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

(async () => {

    const channel = process.env.channel || "@CreepsMcPasta";
    const timeout = process.env.timeout || "60s";
    const bucket = process.env.bucket || "griffin-record-input";
    const region = process.env.region || "us-east-1";

    console.log({
        channel,
        timeout,
        bucket,
        region
    })

    mustCheckLive(channel).then(async (isLive) => {

        if (isLive.status) {
            //

            createLogWithStream("/microsomes/ecstask/record", moment().format("YYYY-MM-DD-HH") + "-" + channel, "Starting recording for " + channel + " at " + moment().format("YYYY-MM-DD-HH-mm-ss") + " with timeout of " + timeout + " and bucket " + bucket + " and region " + region);

            await tryDownload(timeout, "https://youtube.com" + isLive.link);

            createLogWithStream("/microsomes/ecstask/record", moment().format("YYYY-MM-DD-HH") + "-" + channel, "Finished recording for " + channel + " at " + moment().format("YYYY-MM-DD-HH-mm-ss") + " with timeout of " + timeout + " and bucket " + bucket + " and region " + region);

            const s3 = new aws.S3({
                region: region
            });

            const fileStream = fs.createReadStream('output.mp4');

            const d = moment().format("YYYY-MM-DD-HH-mm-ss");

            const uploadParams = {
                Bucket: bucket,
                Body: fileStream,
                ContentType: "video/mp4",
                Key: channel + d + ".mp4"
            };

            const managedUpload = s3.upload(uploadParams);

            createLogWithStream("/microsomes/ecstask/record", moment().format("YYYY-MM-DD-HH") + "-" + channel, "Uploading to s3 for " + channel + " at " + moment().format("YYYY-MM-DD-HH-mm-ss") + " with timeout of " + timeout + " and bucket " + bucket + " and region " + region);

            managedUpload.on('httpUploadProgress', function (progress) {
                console.log("Progress: " + progress.loaded + " / " + progress.total);
            });

            managedUpload.send(function (err, data) {
                if (err) {
                    console.log("Error", err);

                    createLogWithStream("/microsomes/ecstask/record", moment().format("YYYY-MM-DD-HH") + "-" + channel, "Error uploading to s3 for " + channel + " at " + moment().format("YYYY-MM-DD-HH-mm-ss") + " with timeout of " + timeout + " and bucket " + bucket + " and region " + region);
                }

                if (data) {
                    console.log("Upload Success", data.Location);

                    createLogWithStream("/microsomes/ecstask/record", moment().format("YYYY-MM-DD-HH") + "-" + channel, "Uploaded to s3 for " + channel + " at " + moment().format("YYYY-MM-DD-HH-mm-ss") + " with timeout of " + timeout + " and bucket " + bucket + " and region " + region);

                    fs.rmSync("output.mp4");

                    //presign the url
                    const params = { Bucket: bucket, Key: uploadParams.Key, Expires: 60 * 60 * 24 * 7 };
                    s3.getSignedUrl('getObject', params, async function (err, url) {
                        console.log('The URL is', url);


                        //send callbaxk
                        try {
                            const response = await axios.post(process.env.completionCallbackUrl, {
                                requestId: process.env.RECORD_REQUEST_ID,
                                key: uploadParams.Key,
                                recordId: process.env.RECORD_ID,
                            }, {
                                timeout: 10000 // timeout after 10 seconds
                            });

                            console.log("Completion callback response:", response.data);
                        } catch (err) {
                            console.log("Completion callback error:", err);
                        }


                        createLogWithStream("/microsomes/ecstask/record", moment().format("YYYY-MM-DD-HH") + "-" + channel, "Presigned url for " + channel + " at " + moment().format("YYYY-MM-DD-HH-mm-ss") + " with timeout of " + timeout + " and bucket " + bucket + " and region " + region);

                    });

                }
            });



        } else {
            console.log("NOT LIVE");
        }
    });


})()

