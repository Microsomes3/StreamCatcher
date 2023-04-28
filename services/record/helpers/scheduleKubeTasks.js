const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const moment = require('moment');

const aws = require("aws-sdk")
const sqs = new aws.SQS({
   region: process.env.AWS_REGION_T || "us-east-1",
})

const {
    getStreamCatcherJobDescription,
    getMuxJobDescription
} = require("./jobs")

// Load the configuration file
const kubeconfig = fs.readFileSync('kubeconfig-k8s-zealous-moore.yaml');

// Create a new KubeConfig object
const kc = new k8s.KubeConfig();
kc.loadFromString(kubeconfig);

// Create an API client
const batchApi = kc.makeApiClient(k8s.BatchV1Api);

function scheduleStreamDownload({
    jobId,
    reqId,
    duration,
    isStart,
    provider,
    timeout,
    url
}) {
    return new Promise(async (resolve, reject) => {
        var id = "streamcatcher-" + moment().format("YYYYMMDDHHmmssSSS");

        var storageToUse = "1Gi";

        if (duration < 90) {
            ///256 mb   
            storageToUse = "256Mi";
        }

        if (duration > 3600 && duration <= 7200) {
            storageToUse = "4Gi";
        } else if (duration > 7200 && duration <= 10800) {
            storageToUse = "5Gi";
        } else if (duration > 10800 && duration <= 14400) {
            storageToUse = "6Gi";
        } else if (duration > 14400 && duration <= 18000) {
            storageToUse = "7Gi";
        } else if (duration > 18000 && duration <= 21600) {
            storageToUse = "8Gi";
        } else if (duration > 21600 && duration <= 25200) {
            storageToUse = "9Gi";
        } else if (duration > 25200 && duration <= 28800) {
            storageToUse = "10Gi";
        } else if (duration > 28800 && duration <= 32400) {
            storageToUse = "11Gi";
        }

        console.log("storageToUse", storageToUse);


        const j = getStreamCatcherJobDescription({
            id: id,
            jobId: jobId,
            reqId: reqId,
            storage: storageToUse,
            isStart: isStart,
            provider: provider,
            timeout: timeout,
            updateHook: "https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoOnUpdateRecordCallback",
            url: url,
        })

        try {
            const response = await batchApi.createNamespacedJob('default', j);
            resolve(id);
        } catch (err) {
            reject(err);
        }
    })
}

function scheduleMuxJob({
    jobId,
    reqId,
    videoLink,
    audioLink,
}) {
    return new Promise(async (resolve, reject) => {
        const id = "mux-" + moment().format("YYYYMMDDHHmmssSSS");
        const job = getMuxJobDescription({
            id: id,
            jobId: jobId,
            reqId: reqId,
            storage: "15Gi",
            videoLink: videoLink,
            audioLink: audioLink,
            updateHook: "https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoMuxUpdateRecordCallback"
        })


        try {
            const response = await batchApi.createNamespacedJob('default', job);
            resolve(id);
        }
        catch (err) {
            reject(err);
        }

    })
}

function scheduleMuxJobECS({
    jobId,
    reqId,
    videoLink,
    audioLink}){
        return new Promise((resolve,reject)=>{

            const params = {
                MessageBody: JSON.stringify({
                    jobId: jobId,
                    reqId: reqId,
                    videoLink: videoLink,
                    audioLink: audioLink,
                }),
                QueueUrl: process.env.MUXING_QUEUE_URL
            }

            sqs.sendMessage(params, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })

        })
    }

module.exports = {
    scheduleStreamDownload,
    scheduleMuxJob,
    scheduleMuxJobECS
}