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
const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1"
});
function getRecordRequest(id) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: "RecordRequestTable",
            Key: {
                id: id
            }
        };
        documentClient.get(params, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.Item || {});
            }
        });
    });
}
function getRecordStatusByRecordId({ recordId }) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: "RecordStatuses",
            Key: {
                id: recordId
            }
        };
        const data = await documentClient.get(params).promise();
        if (!data.Item) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({
                    error: "Record not found!"
                }),
            };
        }
        const request = await getRecordRequest(data.Item.recordrequestid);
        const duration = parseInt(request.duration);
        const parts = parseInt(request.maxparts);
        const expectedRuntime = duration * parts;
        data.Item.recordrequest = request;
        const currentTime = parseInt(data.Item.progressState.totalTime);
        const parcentageComplete = (currentTime / expectedRuntime) * 100;
        //if the parcentage is greater than 100, set it to 100
        data.Item.parcentageComplete = parcentageComplete > 100 ? 100 : parcentageComplete;
        resolve(data.Item);
    });
}
module.exports.handler = async (event) => {
    const id = event.pathParameters.id;
    const data = await getRecordStatusByRecordId({ recordId: id });
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(data)
    };
};
