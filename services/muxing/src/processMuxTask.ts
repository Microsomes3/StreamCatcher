import * as aws from "aws-sdk"
import { APIGatewayProxyResult } from 'aws-lambda';

const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || "us-east-1",
})

const TASKDEF = "muxtaskdef"
const CONTAINER = "gomuxcontainer"


function runMuxTask(
    jobId: string,
    reqId: string,
    videoLink: string,
    audioLink: string,
    updatehook: string
) {
    return new Promise((resolve, reject) => {
        const params = {
            taskDefinition: TASKDEF,
            cluster: "griffin-record-cluster",
            launchType: "FARGATE",
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: CONTAINER,
                        environment: [
                            {
                                name: "updatehook",
                                value: updatehook
                            },
                            {
                                name: "jobid",
                                value: jobId
                            },
                            {
                                name: "reqid",
                                value: reqId
                            },
                            {
                                name: "videoLink",
                                value: videoLink
                            },
                            {
                                name: "audioLink",
                                value: audioLink
                            }
                        ]
                    }
                ]
            }
        }
        ecs.runTask(params, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

module.exports.handler = async (event: any): Promise<APIGatewayProxyResult> => {
    //queue message
    const data:any = JSON.parse(event.Records[0].body);

    console.log(data)

    try {

        const { jobId, reqId, videoLink, audioLink } = data;

        const runtask = await runMuxTask(
            jobId,
            reqId,
            videoLink,
            audioLink,
            "https://kxb72rqaei.execute-api.us-east-1.amazonaws.com/dev/GoMuxUpdateRecordCallback"

        )
        console.log(runtask)
    } catch (err) {
        console.log(err)
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "GoUpdateCallback",
            data
        })
    }
}