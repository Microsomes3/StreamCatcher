const { mustCheckLive } = require('./helpers/checkLive')
const { getAllRequiredInfoForTask } = require('./helpers/taskInfoHelper')
const { processNotLive } = require('./helpers/processNotLive')
const { processDownload } = require('./helpers/processDownload')

function startDownloadProcess(){
    return new Promise(async (resolve,reject)=>{

    console.log("starting download process")
    try{

        const { channel, timeout, bucket, region, parts, timeoutupdated, minruntime, isComments, isRecordStart, getIndexAPI,wssocket,recordID,statusCallbackUrl } = getAllRequiredInfoForTask();
        console.log(getAllRequiredInfoForTask())
        const isLive = await mustCheckLive(channel);

        switch(isLive.status){
            case true:
                await processDownload(getAllRequiredInfoForTask())
                resolve()
                break;
            case false:
                console.log("not live")
                await processNotLive(getAllRequiredInfoForTask())
                resolve()
                return;
                break;
            default:
                console.log("default")
                resolve()
                break;
        }

    }catch(e){
       resolve()
    }
            
})
}

startDownloadProcess().then(()=>{
    console.log("done")
})