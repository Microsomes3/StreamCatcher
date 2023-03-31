const { tryDownload } = require('./streamHelper')
const fs = require('fs');
const moment = require('moment');
const { manageUploadST } = require('./uploadHelper')
const { publishProgressUpdate } = require('./publishProgressUpdate')
const { generateThumbnail } = require('./generateThumbnail')
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

            const { paths, status, reason } = await tryDownload({ channel, timeout, mode, wssocket })

            const currentDateTime = moment().format("YYYY-MM-DD-HH-mm-ss");

            const fileStream = fs.createReadStream(paths[0]);

            const friendlyName = paths[0].split(".mp4")[0]

            const uploadParams = {
                Bucket: bucket,
                Body: fileStream,
                ContentType: "video/mp4",
                Key: mode + recordRequestId + "_" + channel + "_" + recordID + "_" + currentDateTime + ".mp4"
            };

            const loc = await manageUploadST(uploadParams);

            await publishProgressUpdate({
                status: status,
                reason: reason,
                recordID,
                recordRequestId,
                statusCallbackUrl,
                paths: [loc],
                friendlyName: friendlyName
            })

            try {
               await generateThumbnail(paths[0], "thump.jpeg")

                const thumbParams = {
                    Bucket: bucket,
                    Body: fs.createReadStream("thump.jpeg"),
                    ContentType: "image/jpeg",
                    Key: recordID + "_thump.jpeg"
                };

                const thumbLoc = await manageUploadST(thumbParams);
            } catch (e) {
                console.log(e);
             }




            resolve()

        } catch (err) {
            console.log(err);

            await publishProgressUpdate({
                status: "failed",
                reason: "error",
                recordID,
                recordRequestId,
                statusCallbackUrl,
                paths: []
            })

            resolve()

        }

    })
}


// const [downloadResult,downloadResult2, commentsP] = await Promise.all([
//     isRecordFromStart == true ? tryDownload(channel,timeout,stopCapturingComments,"start",wssocket): ()=>{
//         return new Promise((resolve,reject)=>{
//             resolve()
//         })
//     },
//     isRecordFromStart== false ?tryDownload(channel,timeout,stopCapturingComments,"current",wssocket):() => {
//         return new Promise((resolve, reject) => {
//             resolve()
//         })
//     },
//     isComments == "yes" ? fetchComments({ url: "https://youtube.com/live_chat?is_popout=1&v=" + videoId }) : () => {
//         return new Promise((resolve, reject) => {
//             resolve()
//         })
//     }
// ]);

// var paths = []
// var status = ""
// var reason = ""
// var comments = []

// if (isRecordFromStart == true) {
//     paths = downloadResult.paths;
//     status = downloadResult.status;
//     reason = downloadResult.reason;
//     comments = downloadResult.comments;
// }else if(isRecordFromStart == false){
//     paths = downloadResult2.paths;
//     status = downloadResult2.status;
//     reason = downloadResult2.reason;
//     comments = downloadResult2.comments;
// }


// if (isComments == "yes") {

//     console.log(">>", comments);

//     try{

//     //upload comments
//     fs.writeFileSync("comments_g.json", JSON.stringify(comments));
//     const fileStream = fs.createReadStream("comments_g.json");
//     const d = moment().format("YYYY-MM-DD-HH-mm-ss");
//     const uploadParams = {
//         Bucket: bucket,
//         Body: fileStream,
//         ContentType: "application/json",
//         Key: process.env.RECORD_ID + "____comments___" + d + ".json"
//     };

//     const loc = await manageUploadST(uploadParams, region);

//     console.log("comments uploaded", loc);
// }catch(e){}
// }


// const allLocs = [];
// for (var i = 0; i < paths.length; i++) {
//     const fileStream = fs.createReadStream(paths[i]);
//     const d = moment().format("YYYY-MM-DD-HH-mm-ss");

//     const uploadParams = {
//         Bucket: bucket,
//         Body: fileStream,
//         ContentType: "video/mp4",
//         Key: process.env.RECORD_ID+"_"+channel + "____part___" + i + "___" + d + ".mp4"
//     };

//     const loc = await manageUploadST(uploadParams, region);
//     allLocs.push(loc);
// }

// console.log("send callback");
// console.log(allLocs);
// console.log("status", status);
// console.log("reason", reason);

// try {
//     const response = await axios.post(process.env.completionCallbackUrl, {
//         requestId: process.env.RECORD_REQUEST_ID,
//         keys: allLocs,
//         status: {
//             status: status,
//             reason: reason
//         },
//         recordId: process.env.RECORD_ID,
//     }, {
//         timeout: 10000 // timeout after 10 seconds
//     });

//     console.log("callback response", response.data);
// } catch (e) { }



module.exports = {
    processDownload
}