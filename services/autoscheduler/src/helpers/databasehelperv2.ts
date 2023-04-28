import * as aws from "aws-sdk";
import { checkWhichRequestsShouldTrigger } from "./recordHelper";

const tableName = process.env.AUTO_SCHEDULE_TABLEV3 || "griffin-autoscheduler-service-dev-AutoScheduleV3Table-SDFUN2OI5LO5"

const documentClient = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || 'us-east-1'
});


type Params = {
    TableName: string;
    ExclusiveStartKey?: any;
}

const getAllRecords = async (table: string): Promise<any[]> => {

    var params: Params = {
        TableName: table,
    };

    let items: any[] = [];
    let data = await documentClient.scan(params).promise();
    if (data.Items) {
        items = [...items, ...data.Items];
        while (typeof data.LastEvaluatedKey !== "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            data = await documentClient.scan(params).promise();
            items = [...items, ...data.Items || []];
        }
    }
    return items;
};


export function deleteAllScheduledTasks() {
    return new Promise(async (resolve, reject) => {
        try {
            getAllRecords(tableName).then(async data => {
                console.log("data", data.length);

                const batches: any = [];

                for (let i = 0; i < data.length; i++) {
                    if (i % 25 === 0) {
                        batches.push([])
                    }
                    batches[batches.length - 1].push(data[i])
                }

                for (let i = 0; i < batches.length; i++) {
                    console.log("batch", i + "/" + batches.length);
                    const deleteParams: any = {
                        RequestItems: {
                            [tableName]: []
                        }
                    }

                    batches[i].forEach((item: any) => {
                        deleteParams.RequestItems[tableName].push({
                            DeleteRequest: {
                                Key: {
                                    recordrequestid: item.recordrequestid
                                }
                            }
                        })
                    });

                    await documentClient.batchWrite(deleteParams).promise();
                }


                resolve(null)


            })
        } catch (e) {
            reject(e)
        }
    })
}

type AllRecordRequestsToScheduleParam = {
    youtuber: string
}

export function getAllRecordRequestsByUsername(username:string) {
    return new Promise((resolve, reject) => {
        try {

            const params = {
                TableName: process.env.RECORD_REQUEST_TABLE || "RecordRequestTable",
                IndexName: process.env.RECORD_RECORD_USERNAME_INDEX || "username-index",
                KeyConditionExpression: "username = :username",
                ExpressionAttributeValues: {
                    ":username": username
                }
            }

            const results = documentClient.query(params).promise();

            resolve(results);

        } catch (e) {
            console.log(e);
            reject([]);
        }

    })
}
export function getAllRecordRequestsToSchedule(opt: AllRecordRequestsToScheduleParam):Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
        try {
            var tableName: string = process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "AggregateCurrentYoutuberLive"

            var params = {
                TableName: tableName,
                KeyConditionExpression: "youtubeusername = :youtuber",
                ExpressionAttributeValues: {
                    ":youtuber": opt.youtuber
                }
            }

            const data = await documentClient.query(params).promise();

            if (data.Items) {

                const liveYoutubers = data.Items;

                const liveYoutubersFiltered = liveYoutubers.filter((youtuber) => {
                    return youtuber.isLive === true;
                });

                var allLiveUsernamesAndTheirRequests = [];

                for (let i = 0; i < liveYoutubersFiltered.length; i++) {
                    const username = liveYoutubersFiltered[i].youtubeusername;
                    const livelink = liveYoutubersFiltered[i].liveLink;
                    const requests:any = await getAllRecordRequestsByUsername(username);

                    allLiveUsernamesAndTheirRequests.push({
                        username,
                        livelink,
                        requests: requests.Items || []
                    })
                }


                //filter and remove all usernames that do not have any record requests
                allLiveUsernamesAndTheirRequests = allLiveUsernamesAndTheirRequests.filter((d) => {
                    return d.requests.length > 0;
                })

                console.log("allLiveUsernamesAndTheirRequests", allLiveUsernamesAndTheirRequests);

                var allRecordRequestsToTrigger = [];

                for (let i = 0; i < allLiveUsernamesAndTheirRequests.length; i++) {
                    const username = allLiveUsernamesAndTheirRequests[i].username;
                    const livelink = allLiveUsernamesAndTheirRequests[i].livelink;
                    const requests = allLiveUsernamesAndTheirRequests[i].requests;

                    console.log("checking for", username);
                    console.log("requests to check", requests.length);

                    const requestsToTrigger:any = await checkWhichRequestsShouldTrigger(
                        requests,
                    );

                    console.log("requests to trigger", requestsToTrigger.length);


                    allRecordRequestsToTrigger.push(requestsToTrigger);

                }
            }

            console.log(allRecordRequestsToTrigger);


            resolve(allRecordRequestsToTrigger || []);


        } catch (err) {
            reject([]);
        }
    })
}

export function checkIfRequestExists(requestid:number):Promise<boolean> {
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

export function addScheduledTask(
    requestid:number,
    hour:string,
    minute:string,
    trigger:string,
    channel:string
) {
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

export function getScheduledTask(
    requestid:number
) {
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
