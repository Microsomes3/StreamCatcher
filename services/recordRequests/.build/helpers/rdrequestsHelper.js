"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequestsFromUser = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const documentClient = new aws_sdk_1.default.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1',
});
const getAllRecordRequests = async () => {
    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
    };
    const data = await documentClient.scan(params).promise();
    return data;
};
const getAllRequestsFromUser = async (username) => {
    const params = {
        TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username,
        },
    };
    const result = await documentClient.query(params).promise();
    return result;
};
exports.getAllRequestsFromUser = getAllRequestsFromUser;
module.exports = {
    getAllRecordRequests,
    getAllRequestsFromUser: exports.getAllRequestsFromUser
};
