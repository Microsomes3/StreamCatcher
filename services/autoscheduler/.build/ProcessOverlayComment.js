"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const submitRecordingsRequest_1 = require("./helpers/submitRecordingsRequest");
module.exports.handler = async (event) => {
    const { video, comment, } = JSON.parse(event.body || '{}');
    const vi = await (0, submitRecordingsRequest_1.overlayCommentTask)({
        video: video,
        comment: comment,
    });
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "record comment adhoc",
            vi
        })
    };
};
