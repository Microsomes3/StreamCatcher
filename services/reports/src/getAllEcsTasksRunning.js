const aws = require('aws-sdk');

const ecs = new aws.ECS({
    region: process.env.AWS_REGION_T || 'us-east-1',
});


(async ()=>{
    //get all tasks running
    const params = {
        cluster: process.env.CLUSTER_NAME || "griffin-record-cluster",
        desiredStatus: "RUNNING",
    };

    const data = await ecs.listTasks(params).promise();

    const taskArns = data.taskArns;

    console.log(taskArns);
})()

module.exports.handler = async (event) => {
    //get all tasks running
    const params = {
        cluster: process.env.CLUSTER_NAME,
        desiredStatus: "RUNNING",
    };

    const data = await ecs.listTasks(params).promise();

    console.log(data);

    const taskArns = data.taskArns;

    const taskParams = {
        cluster: process.env.CLUSTER_NAME,
        tasks: taskArns,
    };

    const taskData = await ecs.describeTasks(taskParams).promise();

    const tasks = taskData.tasks;

    const results = tasks.map((task)=>{

        const container = task.containers[0];

        const env = container.environment;

        const recordRequestId = env.find((e)=>e.name === "RECORD_REQUEST_ID").value;
        const recordId = env.find((e)=>e.name === "RECORD_ID").value;
        const parts = env.find((e)=>e.name === "parts").value;
        const minruntime = env.find((e)=>e.name === "minruntime").value;
        const timeout = env.find((e)=>e.name === "timeout").value;

        return {
            recordRequestId,
            recordId,
            parts,
            minruntime,
            timeout,
        }
    })

    return {
        statusCode: 200,
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
            results,
        }),
    }
    }