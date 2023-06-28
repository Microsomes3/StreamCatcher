"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const submitRecordingsRequest_1 = require("./helpers/submitRecordingsRequest");
module.exports.handler = async (event) => {
    const { username, timeout, jobId, callbackurl = "" } = JSON.parse(event.body || '{}');
    //error checking username
    if (username == "") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "username is empty"
            })
        };
    }
    //error checking timeout
    if (timeout == "") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "timeout is empty"
            })
        };
    }
    //error checking jobId
    if (jobId == "") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "jobId is empty"
            })
        };
    }
    var commentVideoRequest = await (0, submitRecordingsRequest_1.captureCommentVideoV2Task)({
        jobId: jobId,
        username: username,
        timeout: timeout,
        callbackurl: callbackurl
    });
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "record comment adhoc",
            data: commentVideoRequest
        })
    };
};
