const aws = require('aws-sdk');
const sha256 = require('crypto-js/sha256');
const moment = require('moment');

const {
    scheduleMuxJob,
    scheduleStreamDownload
} = require("./scheduleKubeTasks")

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

function makeRecordRequest({ requestId, auto, provider="youtube" }) {
    return new Promise(async (resolve, reject) => {

        console.log(">>", provider);
        

        try {

            console.log(">>", requestId);

            const documentWriter = new aws.DynamoDB.DocumentClient({
                region: process.env.AWS_REGION_T || 'us-east-1'
            });

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || 'RecordRequestTable',
                Key: {
                    id: requestId
                }
            };

            const data = await documentWriter.get(params).promise();

            if (!data.Item) {
                reject({
                  statusCode: 404,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                  },
                  body: JSON.stringify({
                    error: "Record not found!"
                  }),
                });
              }              

            const {duration, isRecordStart = false, isComments = false, username } = data.Item;


            console.log({
                duration,
                isRecordStart,
                isComments,
                username,
            })



            if (!data.Item) {
                reject({
                    statusCode: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    },
                    body: JSON.stringify({
                        error: "Record not found!"
                    }),
                });
            }


            const uniqueRecordId = uuidv4();            

           const sid= await scheduleStreamDownload({
                jobId:uniqueRecordId,
                reqId: requestId,
                duration: duration.toString(),
                isStart: isRecordStart == true ? "true" : "false",
                provider: provider,
                timeout: duration.toString(),
                url: provider === "youtube" ? `https://youtube.com/${username}/live`: `https://twitch.tv/${username}/live`,
            })

            const paramsStatuses = {
                TableName: process.env.RECORD_STATUS_TABLE || 'RecordStatuses',
                Item: {
                    id: uniqueRecordId,
                    recordrequestid: requestId,
                    status: "PENDING",
                    username: username,
                    friendlyDate: moment().format("YYYY-MM-DD"),
                    timestarted: moment().unix(),
                    timeended: null,
                    createdAt: new Date().getTime(),
                    kubejobid: sid,
                    progressState: {
                        currentRecordedRunTime: 0,
                        totalParts: 0,
                        storageUsed: 0,
                        totalTime: 0
                    }
                },
            };

            await documentWriter.put(paramsStatuses).promise();

            try {
                const addRecordTablePending = {
                    TableName: process.env.RECORD_TABLE || 'RecordTable',
                    Item: {
                        id: uniqueRecordId,
                        recordrequestid: requestId,
                        date: moment().format("YYYY-MM-DD"),
                        keys: [],
                        username: username,
                        status: "pending",
                        kubejobid: sid,
                        createdAt: new Date().getTime(),
                    },
                };

                await documentWriter.put(addRecordTablePending).promise();
            } catch (e) {
                console.log(e);
             }

            resolve({
                statusCode: 200,
                recordId: uniqueRecordId,
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }

    })
}


module.exports = {
    makeRecordRequest
}