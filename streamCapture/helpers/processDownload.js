const { tryDownload } = require('./streamHelper')
const fs = require('fs');
const moment = require('moment');
const { manageUploadST } = require('./uploadHelper')
const { publishProgressUpdate } = require('./publishProgressUpdate')
const { generateThumbnail } = require('./generateThumbnail');
const path = require('path');
function processDownload({
    channel,
    isRecordStart,
    wssocket,
    recordID,
    recordRequestId,
    timeout,
    bucket,
    statusCallbackUrl
}) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("downloading >>", channel, timeout, wssocket, recordID, recordRequestId, isRecordStart);
        
            
            var isRecordFromStart = isRecordStart == "yes" ? true : false;
            const mode = isRecordFromStart == true ? "start" : "current";

            const c =await publishProgressUpdate({
                status: "recording",
                reason: "recording started:"+ moment().format("YYYY-MM-DD HH:mm:ss"),
                recordID,
                recordRequestId,
                statusCallbackUrl,
                paths: [],
                friendlyName: friendlyName
            })

        
            const { paths, status, reason } = await tryDownload({ channel, timeout, mode, wssocket })

            console.log("download complete", paths, status, reason);

            console.log(">>>", paths);

            var allLocs = [];

            var friendlyName = "";

            for(let i = 0; i < paths[0].length; i++){
                const currentPath = path.join(__dirname, '..', paths[0][i]);
                console.log("currentPath", currentPath);
                const fileSteam= fs.createReadStream(currentPath)
                console.log("uploading", currentPath);
                const currentDateTime = moment().format("YYYY-MM-DD-HH-mm-ss"); 

                var pathsl= paths[0][i].split(".")

                console.log("pathsl", pathsl.length);
                
                var bucketToUse = bucket;

                if(pathsl.length ==3 ){
                    bucketToUse = "griffin-record-input-parts";
                }
                
                const uploadParams = {
                    Bucket: bucketToUse,
                    Body: fileSteam,
                    ContentType: "video/mp4",
                    Key: channel+"_"+recordID+"_"+paths[0][i]
                };

                const loc = await manageUploadST(uploadParams);

                allLocs.push(loc);
            }
            

            var loc = allLocs.filter((item)=>{
                if(item.split(".").length == 3){
                    return false
                }
                return true
            })

            await publishProgressUpdate({
                status: status,
                reason: reason,
                recordID,
                recordRequestId,
                statusCallbackUrl,
                paths: loc,
                friendlyName: friendlyName
            })

          
            resolve()

        } catch (err) {
            console.log("error");
            console.log(err);

            await publishProgressUpdate({
                status: "failed",
                reason: err.message,
                recordID,
                recordRequestId,
                statusCallbackUrl,
                paths: []
            })

            resolve()

        }finally{
            resolve()
        }

    })
}

module.exports = {
    processDownload
}