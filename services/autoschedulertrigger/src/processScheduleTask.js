const aws = require('aws-sdk');
const { makeRecordRequest } = require('./helpers/submitRecordingsRequest');

const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});



function captureCommentRunTask({
    username,
    duration
}){
    return new Promise((resolve,reject)=>{
        const taskDef = "GoCommentCaptureTask"
        const containerName = "GoCommentCaptureContainer"

        const ecsparams = {
            cluster: "griffin-record-cluster",
            taskDefinition: taskDef,
            launchType: "FARGATE",
            //extra env vars
            overrides: {
                containerOverrides: [
                    {
                        name: containerName,
                        environment: [
                            {
                                name:'username',
                                value:username
                            },
                            {
                                name:'timeout',
                                value:duration
                            }
                        ],
                    },
                ],
            },
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-035b7122",
                    ],
                    assignPublicIp: "ENABLED",
                }
            },
            tags: [
                {
                    key: "username",
                    value: username
                }
            ]
        };

        ecs.runTask(ecsparams, function(err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Success", data);
                resolve(data);
            }
        })

    })
}

function handleFunc(request,auto){
return new Promise(async (resolve,reject)=>{

    console.log(request);

    const c =await makeRecordRequest({
        requestId: request.id,
        auto: auto,
        provider: request.provider || 'youtube',
    });

    try{
        if(request.isComments){
            const td=request.duration;

            console.log(">>>duration",td);

            await captureCommentRunTask({
                username: request.username,
                duration: request.duration.toString()
            })
        }
    }catch(err){
        console.log(err);
    }

    resolve(c);

})
}


module.exports.handler = async (event) => {

    //queue message
    const {request, auto} = JSON.parse(event.Records[0].body);

    const status = await handleFunc(request,auto);


    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'will callback',
            liveStatus: status,
        }),
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    }
};