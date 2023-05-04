"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const rdrequestsHelper_1 = require("./helpers/rdrequestsHelper");
module.exports.handler = async (event) => {
    try {
        const user = await axios_1.default.get("https://21tk2wt1ye.execute-api.us-east-1.amazonaws.com/dev/me", {
            headers: {
                'Authorization': event.headers.Authorization,
            }
        });
        const { id: userid } = user.data.user;
        const requestId = event.pathParameters?.id || "";
        const deleteResult = await (0, rdrequestsHelper_1.deleteRecordRequestById)(requestId, userid);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                result: deleteResult,
            })
        };
    }
    catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: err,
            }),
        };
    }
};
