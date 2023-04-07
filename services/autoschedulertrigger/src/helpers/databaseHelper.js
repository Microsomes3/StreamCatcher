const aws = require('aws-sdk');

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1'
});

const tableName = process.env.AUTO_SCHEDULE_TABLEV3 || "griffin-autoscheduler-service-dev-AutoScheduleV3Table-SDFUN2OI5LO5"

function checkIfRequestExists({ requestid }) {
    return new Promise(async (resolve, reject) => {

        const params = {
            TableName: tableName,
            Key: {
                recordrequestid: requestid
            }
        }

        try {
            const data = await documentClient.get(params).promise();
            if (data.Item) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}

function addScheduledTask({
    requestid,
    hour,
    minute,
    trigger,
    channel
}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
                recordrequestid: requestid,
                hour,
                minute,
                trigger,
                channel
            }
        }
        try {
            const data = await documentClient.put(params).promise();
            resolve(data)
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}


function getScheduledTask({
    requestid
}) {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                recordrequestid: requestid
            }
        }
        try {
            const data = await documentClient.get(params).promise();
            resolve(data.Item || null)
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}


function getAllScheduledTasks() {
    const tasks = [];
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: tableName,
        }
        try {
            const data = await documentClient.scan(params).promise();
            data.Items.forEach(item => {
                tasks.push(item)
            });
            resolve(tasks)
        } catch (error) {
            console.log(error);
            reject(error)
        }
    }
    )
}

var deleteItem = function (id) {
    var params = {
        TableName: tableName,
        Key: {
            "recordrequestid": id
        },
    };

    return new Promise(function (resolve, reject) {
        documentClient.delete(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                console.log("deleted");
                resolve();
            }
        });
    });
}

const getAllRecords = async (table) => {
    let params = {
        TableName: table,
    };
    let items = [];
    let data = await documentClient.scan(params).promise();
    items = [...items, ...data.Items];
    while (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        data = await documentClient.scan(params).promise();
        items = [...items, ...data.Items];
    }
    return items;
};

function deleteAllScheduledTasks() {
    return new Promise(async (resolve, reject) => {
        try {
            getAllRecords(tableName).then(async data => {
                console.log("data", data.length);
                const batches = [];

                for (let i = 0; i < data.length; i++) {
                    if (i % 25 === 0) {
                        batches.push([])
                    }
                    batches[batches.length - 1].push(data[i])
                }

                for (let i = 0; i < batches.length; i++) {
                    console.log("batch", i + "/" + batches.length);
                    const deleteParams = {
                        RequestItems: {
                            [tableName]: []
                        }
                    }

                    batches[i].forEach(item => {
                        deleteParams.RequestItems[tableName].push({
                            DeleteRequest: {
                                Key: {
                                    recordrequestid: item.recordrequestid
                                }
                            }
                        })
                    });

                    const deleteData = await documentClient.batchWrite(deleteParams).promise();
                }


                resolve()


            })
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    checkIfRequestExists,
    addScheduledTask,
    getScheduledTask,
    deleteAllScheduledTasks
}