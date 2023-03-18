const aws = require('aws-sdk');

const sqs = new aws.SQS({
    region: process.env.AWS_REGION_T,
});


module.exports.handler = async (event) => {

    const newImage = event.Records[0].dynamodb.NewImage;

    console.log(newImage);

    try {
        const id = newImage.id.S;
        const username = newImage.username.S;
        const duration = newImage.duration.N;
        const params = {
            MessageBody: JSON.stringify({
                id,
                username,
                duration,
            }),
            QueueUrl: process.env.PROCESS_TASK_CREATION_QUEUEUrl,
        };

        const data = await sqs.sendMessage(params).promise();
        console.log(data);
    } catch (e) {
        console.log("no new image")
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            input: []
        }),
    };

}
