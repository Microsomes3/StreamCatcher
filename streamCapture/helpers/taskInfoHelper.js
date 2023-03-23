

function getAllRequiredInfoForTask(){

    const channel = process.env.channel || "@griffingaming";
    const timeout = process.env.timeout || "120s";
    const bucket = process.env.bucket || "griffin-record-input";
    const region = process.env.region || "us-east-1";
    const parts = process.env.parts || 3;
    const timeoutupdated= process.env.lastupdatedtimeout || 300;
    const minruntime = process.env.minruntime || 60;


    return {
        channel,
        timeout,
        bucket,
        region,
        parts,
        timeoutupdated,
        minruntime
    }

}

module.exports = {
    getAllRequiredInfoForTask
}