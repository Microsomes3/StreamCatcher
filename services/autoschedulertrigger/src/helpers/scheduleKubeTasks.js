const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const moment = require('moment');

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

        duration = parseInt(duration);

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
        }else if (duration >32401){
            storageToUse = "15Gi";
        }

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

// scheduleMuxJob({
//     jobId: "1a493b1d-49f0-4767-bfc9-5c5dc8cc3a28",
//     reqId:"40df4b8e-54b0-4e38-a94b-5c5f869ff7ea",
//     videoLink:"https://d213lwr54yo0m8.cloudfront.net/0_1a493b1d-49f0-4767-bfc9-5c5dc8cc3a28.mp4",
//     audioLink:"https://d213lwr54yo0m8.cloudfront.net/1_1a493b1d-49f0-4767-bfc9-5c5dc8cc3a28.mp4"
// }).then((l)=>{
//     console.log(l);
// })

module.exports = {
    scheduleStreamDownload,
    scheduleMuxJob
}