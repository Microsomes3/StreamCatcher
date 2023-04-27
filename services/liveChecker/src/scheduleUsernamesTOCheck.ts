import aws from 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda'
const documentWriter = new aws.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION_T || "us-east-1"
});

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T || "us-east-1"
});

function handleFunc(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const params = {
            TableName: process.env.YOUTUBERS_TO_CHECK_TABLE || "YoutubersToCheckTable",
        };

        const data = await documentWriter.scan(params).promise();
        if (data.Items) {

            for (var i = 0; i < data.Items.length; i++) {
                const cur = data.Items[i];
                const params = {
                    MessageBody: JSON.stringify(cur),
                    QueueUrl: process.env.YOUTUBERS_TO_CHECK_QUEUEUrl || "https://sqs.us-east-1.amazonaws.com/574134043875/YoutubersToCheckQueue"
                };
                await sqs.sendMessage(params).promise();
            }
        }

        resolve(true)
    })
}


module.exports.handler = async (): Promise<APIGatewayProxyResult> => {
    await handleFunc();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
        }),
    }
}