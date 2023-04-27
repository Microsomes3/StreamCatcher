import aws from 'aws-sdk';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { QueryLiveCheckerPriority } from './types/dynamodbQuery'
const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T
});

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T
});


module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const params: QueryLiveCheckerPriority = {
        TableName: process.env.YOUTUBERS_TO_CHECK_TABLE || "",
        IndexName: "priority-index",
        KeyConditionExpression: "priority = :priority",
        ExpressionAttributeValues: {
            ":priority": 1,
        },
    }

    const data = await documentWriter.query(params).promise();

    if (data.Items) {
        const usernames = data.Items.map((item) => {
            return item.youtubeusername;
        });


        for (var i = 0; i < usernames.length; i++) {
            const cur = data.Items[i];
            let params:any = {
                MessageBody: JSON.stringify(cur),
                QueueUrl: process.env.YOUTUBERS_TO_CHECK_QUEUEUrl
            };

            await sqs.sendMessage(params).promise();

        }

    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "OK"
        }),
    }
}