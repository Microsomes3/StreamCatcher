"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recordHelper_1 = require("./helpers/recordHelper");
function handleIsStartLogic({ jobId, reqId, results, state }) {
    return new Promise(async (resolve, reject) => {
        if (state == "done") {
            if (results.length >= 2) {
                console.log("send to mux service");
                try {
                    const c = await (0, recordHelper_1.scheduleMuxJobECS)({
                        jobId: jobId,
                        reqId: reqId,
                        videoLink: results[0],
                        audioLink: results[1]
                    });
                    console.log(c);
                }
                catch (e) {
                    console.log(e);
                }
                resolve("muxing");
            }
            else {
                console.log("do not send to mux");
                resolve("error - not enough results");
            }
        }
        else {
            console.log("do not send to mux");
            resolve("awaiting mux");
        }
    });
}
function handleFunc({ data }) {
    return new Promise(async (resolve, reject) => {
        const { Job, Status } = data;
        const { jobId, reqId, youtubeLink, channelName, type = "normal", isStart = false } = Job;
        const { result, state } = Status;
        var stateToUse = state;
        switch (isStart) {
            case true:
                stateToUse = await handleIsStartLogic({
                    jobId,
                    reqId,
                    results: Status.result,
                    state: Status.state
                });
        }
        const c = await (0, recordHelper_1.updateRecordStatus)({
            jobId: jobId,
            reqId: reqId,
            result: isStart == false ? [result] : [],
            state: stateToUse,
            channelName: channelName
        });
        const ur = await (0, recordHelper_1.updateRecordStatuses)({
            jobId: jobId,
            state: stateToUse
        });
        const ae = await (0, recordHelper_1.addRecordEvent)({
            Job,
            Status,
            Recordid: jobId
        });
        if (state == "done" && isStart == false) {
            (0, recordHelper_1.sendRecordingToShitpost)({
                url: result[0],
            });
        }
        console.log(ae);
    });
}
module.exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    try {
        await (0, recordHelper_1.sendRecordDataTOApi)({
            data: data
        });
    }
    catch (err) {
    }
    console.log(">>", data);
    await handleFunc({ data });
    console.log("--------------");
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'GoUpdateCallback',
        }),
    };
};
