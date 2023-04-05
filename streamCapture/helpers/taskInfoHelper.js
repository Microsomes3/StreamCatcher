

function getAllRequiredInfoForTask(){

    const channel = process.env.channel || "@DSPGaming";
    const timeout = process.env.timeout || "300s";
    const bucket = process.env.bucket || "griffin-record-input";
    const region = process.env.region || "us-east-1";
    const parts = process.env.parts || 1;
    const timeoutupdated= process.env.lastupdatedtimeout || 300;
    const minruntime = process.env.minruntime || 60;
    const isComments = process.env.isComments || "no";
    const isRecordStart = process.env.isRecordStart || "yes";
    const getIndexAPI = process.env.getIndexapi || "https://5pyt5gawvk.execute-api.us-east-1.amazonaws.com/dev/getLiveIndex";
    const wssocket = process.env.wssocket || "wss://7hivo8j534.execute-api.us-east-1.amazonaws.com/dev";
    const recordID = process.env.RECORD_ID || "1234567890";
    const recordRequestId = process.env.RECORD_REQUEST_ID || "1234567890";
    const statusCallbackUrl = process.env.completionCallbackUrl || "https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/RecordCompleteCallback";

    return {
        channel,
        timeout,
        bucket,
        region,
        parts,
        timeoutupdated,
        minruntime,
        isComments,
        isRecordStart,
        getIndexAPI,
        wssocket,
        recordID,
        statusCallbackUrl,
        recordRequestId
    }

}

module.exports = {
    getAllRequiredInfoForTask
}