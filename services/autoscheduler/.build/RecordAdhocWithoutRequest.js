"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const submitRecordingsRequest_1 = require("./helpers/submitRecordingsRequest");
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
module.exports.handler = async (event) => {
    var { channel, duration, reqid, jobid, res, engine } = JSON.parse(event.body || '{}');
    var error = false;
    if (reqid == "") {
        error = true;
    }
    if (res == "") {
        res = "720p/best";
    }
    if (engine == "") {
        engine = "ytarchive";
    }
    var c = null;
    if (error == false) {
        const recordId = jobid;
        const provider = channel[0] == '@' ? 'youtube' : 'twitch';
        c = await (0, submitRecordingsRequest_1.submitJobToEcsv2)(channel, reqid, recordId, duration.toString(), false, provider, "no", engine, res);
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "Hello World",
            c,
            reqid,
            channel,
            duration,
            engine,
            res
        })
    };
};
