import { APIGatewayProxyResult } from 'aws-lambda';
import {
    updateRecordStatus,
    updateRecordStatuses,
    addRecordEvent,
    sendRecordingToShitpost,
    getRecordRequestById
} from './helpers/recordHelper'

function handleFunc({ data }:{data:any}) {
    return new Promise(async (resolve, reject) => {
        const { Job, Status } = data
        const { jobId, reqId, type } = Job;
        const { state, result } = Status;
        const request:any = await getRecordRequestById({ id: reqId });
        const { username } = request.Item;


        console.log(">>", jobId, reqId, type)
        console.log(">>", state, result)

        if (state == "done") {
           
            const r2Link = result.r2_file;

            console.log(">>", username)
            console.log(">>", r2Link)
            console.log(">>", jobId)
            console.log(">>", reqId)


            const c = await updateRecordStatus({
                jobId,
                reqId,
                result: [[r2Link]],
                state,
                channelName: username
            })

            const ur = await updateRecordStatuses({
                jobId: jobId,
                state: state
            })

            const ae = await addRecordEvent({
                Job,
                Status,
                Recordid: jobId
            })

            // sendRecordingToShitpost({
            //     url: [r2Link],
            // })


        } else {
            console.log(">>", jobId)
            console.log(">>", username)
            const c = await updateRecordStatus({
                jobId,
                reqId,
                result: [],
                state,
                channelName: username
            })

            const ur = await updateRecordStatuses({
                jobId: jobId,
                state: state
            })

            const ae = await addRecordEvent({
                Job,
                Status,
                Recordid: jobId
            })
        }
    })
}


module.exports.handler = async (event:any):Promise<APIGatewayProxyResult> => {
    const data = JSON.parse(event.body);
    await handleFunc({ data })
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'GoUpdateCallback',
        }),
    }
}