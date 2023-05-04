"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recordHelper_1 = require("./helpers/recordHelper");
function handleFunc({ data }) {
    return new Promise(async (resolve, reject) => {
        const { Job, Status } = data;
        const { jobId, reqId, type } = Job;
        const { state, result } = Status;
        const request = await (0, recordHelper_1.getRecordRequestById)({ id: reqId });
        const { username } = request.Item;
        console.log(">>", jobId, reqId, type);
        console.log(">>", state, result);
        if (state == "done") {
            const r2Link = result.r2_file;
            console.log(">>", username);
            console.log(">>", r2Link);
            console.log(">>", jobId);
            console.log(">>", reqId);
            const c = await (0, recordHelper_1.updateRecordStatus)({
                jobId,
                reqId,
                result: [[r2Link]],
                state,
                channelName: username
            });
            const ur = await (0, recordHelper_1.updateRecordStatuses)({
                jobId: jobId,
                state: state
            });
            const ae = await (0, recordHelper_1.addRecordEvent)({
                Job,
                Status,
                Recordid: jobId
            });
            // sendRecordingToShitpost({
            //     url: [r2Link],
            // })
        }
        else {
            console.log(">>", jobId);
            console.log(">>", username);
            const c = await (0, recordHelper_1.updateRecordStatus)({
                jobId,
                reqId,
                result: [],
                state,
                channelName: username
            });
            const ur = await (0, recordHelper_1.updateRecordStatuses)({
                jobId: jobId,
                state: state
            });
            const ae = await (0, recordHelper_1.addRecordEvent)({
                Job,
                Status,
                Recordid: jobId
            });
        }
    });
}
module.exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    await handleFunc({ data });
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'GoUpdateCallback',
        }),
    };
};
