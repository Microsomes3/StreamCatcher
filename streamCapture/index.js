const { mustCheckLive } = require('./helpers/checkLive')
const { getAllRequiredInfoForTask } = require('./helpers/taskInfoHelper')
const { processNotLive } = require('./helpers/processNotLive')
const { processDownload } = require('./helpers/processDownload')
const fs = require('fs');
const moment = require('moment');


function checkIfMP4FilesExist() {
    return new Promise((resolve, reject) => {
        const allFiles = fs.readdirSync("./").filter(f => f.includes(".mp4"));

        if (allFiles.length == 0) {
            resolve(false);
        } else {
            resolve(true);
        }
    })
}

function checkLoopFileExists() {
    return new Promise((resolve, reject) => {
        var isFileExist = false;
        const check30 = setInterval(async () => {
            isFileExist = await checkIfMP4FilesExist();

            if (isFileExist) {
                console.log("files exist")
                clearInterval(check30)
                resolve(true)
            } else {
                console.log("files do not exist")
            }

        }, 1000)


        //wait 5 minutes
        setTimeout(() => {
            clearInterval(check30)
            resolve(false)
        }, 1000 * 60 * 5)

    })
}

function checkIfActivity() {
    return new Promise(async (resolve, reject) => {
        //check if mp4 files exist, and if their last modified time is less than 5 minutes

        const isFileExist = await checkLoopFileExists();

        console.log("isFileExist", isFileExist)

        if (isFileExist) {
          
            



        } else {
            console.log("no files")
            resolve()
        }






    })
}

function startDownloadProcess() {
    return new Promise(async (resolve, reject) => {

        console.log("starting download process")
        



        try {

            const { channel, timeout, bucket, region, parts, timeoutupdated, minruntime, isComments, isRecordStart, getIndexAPI, wssocket, recordID, statusCallbackUrl, isAuto } = getAllRequiredInfoForTask();
            console.log(getAllRequiredInfoForTask())
            console.log("auto",isAuto)
            const isLive = await mustCheckLive(channel);


            switch (isLive) {
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

        } catch (e) {
            resolve()
        }

    })
}


Promise.race([
    startDownloadProcess(),
    checkIfActivity()
]).then(()=>{
    console.log("done")
    //exit
    process.exit(0)
})