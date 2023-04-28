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
    region: process.env.AWS_REGION_T || "us-east-1",
});
function getAllStatusesByDate(date) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RecordStatusesTable || "RecordStatuses",
            IndexName: "friendly-date-index",
            KeyConditionExpression: "friendlyDate = :date",
            ExpressionAttributeValues: {
                ":date": date,
            },
        };
        const data = await documentClient.query(params).promise();
        resolve(data);
    });
}
module.exports.handler = async (event) => {
    const date = event.pathParameters.date;
    const statuses = await getAllStatusesByDate(date);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            date: date,
            results: statuses.Items || [],
        }),
    };
};
