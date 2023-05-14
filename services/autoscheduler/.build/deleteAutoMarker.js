"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recordHelper_1 = require("./helpers/recordHelper");
module.exports.handler = async (event) => {
    var username = event.pathParameters.username;
    try {
        await (0, recordHelper_1.deleteAutoV3ScheduleMarker)({
            username
        });
    }
    catch (err) {
        console.log("---error---");
        console.log(err);
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "delete auto marker",
            event: event,
            username
        })
    };
    try {
        await (0, recordHelper_1.deleteAutoV3ScheduleMarker)({
            username
        });
        console.log(username);
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "delete auto marker",
                username: username,
            })
        };
    }
    catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "error",
                error: e
            })
        };
    }
};
