"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws = __importStar(require("aws-sdk"));
const submitRecordingsRequest_1 = require("./helpers/submitRecordingsRequest");
const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
function handleFunc(request, auto) {
    return new Promise(async (resolve, reject) => {
        console.log(request);
        const c = await (0, submitRecordingsRequest_1.makeRecordRequest)(request.id, auto, request.provider || 'youtube');
        resolve(c);
    });
}
// handleFunc({
//     id:"40df4b8e-54b0-4e38-a94b-5c5f869ff7ea"
// },"")
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
