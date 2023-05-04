"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecordRequestById = exports.getRequestsByAccountIdAndChannel = exports.getRequestsByAccountId = exports.getAllRequestsFromUser = exports.getAllRecordRequests = void 0;
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
exports.getAllRecordRequests = getAllRecordRequests;
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
const getRequestsByAccountId = (accountId) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            IndexName: 'accountId-index',
            KeyConditionExpression: 'accountId = :accountId',
            ExpressionAttributeValues: {
                ':accountId': accountId,
            },
        };
        documentClient.query(params, (err, data) => {
            if (err) {
                resolve([]);
            }
            else {
                resolve(data.Items);
            }
        });
    });
};
exports.getRequestsByAccountId = getRequestsByAccountId;
const getRequestsByAccountIdAndChannel = (accountId, channel) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            IndexName: 'accountId-index',
            KeyConditionExpression: 'accountId = :accountId',
            ExpressionAttributeValues: {
                ':accountId': accountId,
            },
        };
        documentClient.query(params, (err, data) => {
            if (err) {
                resolve([]);
            }
            else {
                const filtered = data.Items.filter((item) => {
                    return item.username === channel;
                });
                resolve(filtered);
            }
        });
    });
};
exports.getRequestsByAccountIdAndChannel = getRequestsByAccountIdAndChannel;
const deleteRecordRequestById = async (id, accountId) => {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
            Key: {
                id,
            },
        };
        const data = await documentClient.get(params).promise();
        if (data.Item && data.Item.accountId !== accountId) {
            resolve(false);
        }
        else if (data.Item && data.Item.accountId === accountId) {
            documentClient.delete(params, (err, data) => {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        }
        else {
            resolve(false);
        }
    });
};
exports.deleteRecordRequestById = deleteRecordRequestById;
