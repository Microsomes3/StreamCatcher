const aws = require("aws-sdk");

const logs = new aws.CloudWatchLogs({
    region: process.env.AWS_REGION_T || "us-east-1"
});

function checkIfLogGroupExists(groupName) {
    return new Promise((resolve, reject) => {
        logs.describeLogGroups({
            logGroupNamePrefix: groupName
        }, (err, data) => {
            if (err) {
                resolve(false);
            } else {
                if (data.logGroups.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

function checkIfStreamExists(groupName, streamName) {
    return new Promise((resolve, reject) => {
        logs.describeLogStreams({
            logGroupName: groupName,
            logStreamNamePrefix: streamName
        }, (err, data) => {
            if (err) {
                resolve(false);
            } else {
                if (data.logStreams.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

function createLogGroup(groupName) {
    return new Promise((resolve, reject) => {
        logs.createLogGroup({
            logGroupName: groupName
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function createLogStream(groupName, streamName) {
    return new Promise((resolve, reject) => {
        logs.createLogStream({
            logGroupName: groupName,
            logStreamName: streamName
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function createLogWithStream(groupName, streamName, event) {
    return new Promise(async (resolve, reject) => {

        try {

            const existGroup = await checkIfLogGroupExists(groupName);
            const existStream = await checkIfStreamExists(groupName, streamName);

            if (!existGroup) {
                await createLogGroup(groupName);
            }

            if (!existStream) {
                await createLogStream(groupName, streamName);
            }

            logs.putLogEvents({
                logGroupName: groupName,
                logStreamName: streamName,
                logEvents: [
                    {
                        message: event,
                        timestamp: Date.now()
                    }
                ]
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }
            );
        } catch (err) {
            reject(err);
        }

    })
}

module.exports = {
    createLogWithStream
}