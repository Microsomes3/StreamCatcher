import aws from 'aws-sdk';
import moment from 'moment';
import { QueryItemWithKeyExpressionAndIndex } from './types/dynamodbQuery'
import { DynamoDBStreamEvent, APIGatewayProxyResult } from 'aws-lambda';
import { InsertAggreagateItem } from './types/livecheckerInsert'

const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

function getAllRecordRequestsByUsername(username: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const params: QueryItemWithKeyExpressionAndIndex = {
                TableName: process.env.RECORD_REQUEST_TABLE || "",
                IndexName: "username-index",
                KeyConditionExpression: "username = :username",
                ExpressionAttributeValues: {
                    ":username": username,
                },
            }

            const data = await documentWriter.query(params).promise();
            resolve(data.Items || []);
        } catch (e) {
            resolve([]);
        }
    })
}

module.exports.handler = async (event: DynamoDBStreamEvent): Promise<APIGatewayProxyResult> => {

    for (let record of event.Records) {
        try {
            const newImage = record.dynamodb?.NewImage;
            const channel: any = newImage?.channel.S;
            const isLive = newImage?.isLive.BOOL || false;
            var type: any = "youtube"

            try {
                type = newImage?.type.S;
            } catch (e) { }

            if (isLive) {
                console.log("islive")
            } else {
                console.log("not islive")
            }

            console.log("channel", channel);

            var totalRecordRequests = 0;

            try {

                const recordRequests = await getAllRecordRequestsByUsername(channel);
                totalRecordRequests = recordRequests.length;

            } catch (e) {
                console.log(e);
            }

            const params: InsertAggreagateItem = {
                TableName: process.env.AGGREGATE_CURRENT_YOUTUBER_LIVE_TABLE || "",
                Item: {
                    youtubeusername: channel,
                    isLive: isLive,
                    type: type,
                    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                    extra: newImage,
                    liveLink: newImage?.liveLink.S || "",
                    recordRequests: totalRecordRequests
                },
            };

            await documentWriter.put(params).promise();
        } catch (e) {
            console.log(e);
        }

    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }),
    };

}