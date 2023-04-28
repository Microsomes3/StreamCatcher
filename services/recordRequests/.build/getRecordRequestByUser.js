"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rdrequestsHelper_1 = require("./helpers/rdrequestsHelper");
module.exports.handler = async (event) => {
    const username = event.pathParameters?.username;
    const data = await (0, rdrequestsHelper_1.getAllRequestsFromUser)(username || "");
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            input: username,
            data,
        }),
    };
};
