"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const submitRecordingsRequest_1 = require("./helpers/submitRecordingsRequest");
function handleFunc(request, auto) {
    return new Promise(async (resolve, reject) => {
        console.log(request);
        const c = await (0, submitRecordingsRequest_1.makeRecordRequest)(request.id, auto, request.provider || 'youtube');
        resolve(c);
    });
}
module.exports.handler = async (event) => {
    //queue message
    const { request, auto } = JSON.parse(event.Records[0].body);
    const status = await handleFunc(request, auto);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
            liveStatus: status,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
};
