

function getAllRequiredInfoForTask(){

    const channel = process.env.channel || "@CreepsMcPasta";
    const timeout = process.env.timeout || "20s";
    const bucket = process.env.bucket || "griffin-record-input";
    const region = process.env.region || "us-east-1";
    const parts = process.env.parts || 1;
    const timeoutupdated= process.env.lastupdatedtimeout || 300;
    const minruntime = process.env.minruntime || 60;
    const isComments = process.env.isComments || "yes";


    return {
        channel,
        timeout,
        bucket,
        region,
        parts,
        timeoutupdated,
        minruntime,
        isComments
    }

}

module.exports = {
    getAllRequiredInfoForTask
}