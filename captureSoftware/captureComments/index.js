const {
    scrapeComments,
} = require("./comments.js")

const { manageUploadST } = require("./upload")

const axios = require("axios");

const aws = require("aws-sdk")

const momnet = require("moment")

const fs = require("fs")

const s3 = new aws.S3({
    region: "us-east-1"
})

const {
    getLiveStatusv2,
    getLiveIdv2
} = require("./helpers/checkLive.js")


function processTimeout({timeout}){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve()
        },timeout)
    })
}

function saveFileTOs3({key,file}){
    return new Promise((resolve,reject)=>{
        const params = {
            Bucket: "catchercomments",
            Key: key,
            Body: file
        }

        s3.putObject(params, (err, data) => {
            if (err) {
                console.log(err)
                reject()
            }
            console.log("success")
            resolve()

        })
    })
}

function start({
    username,
    timeout
}){
    return new Promise(async (resolve,reject)=>{
        const isLive = await getLiveStatusv2("yt-dlp", username)

        if(isLive){
            try{

            const getChannelId = await axios.get(`https://www.youtube.com/${username}/live`)

            const videoId = await getLiveIdv2("yt-dlp", username)

            console.log(videoId)
            const comments = await scrapeComments({
                videoId: videoId,
                timeoutSecond: timeout
            })

            console.log("comments", comments.length)


            const curDate = momnet().format("YYYY-MM-DD HH:mm:ss")

            const toUploads = [
                {
                    Bucket: "catchercomments",
                    Key: `comments/${username}/${curDate}.json`,
                    Body: JSON.stringify(comments)
                },
                {
                    Bucket: "catchercomments",
                    Key: `comments/${username}/${curDate}.mp4`,
                    Body: fs.createReadStream("comment.mp4"),
                    ContentType: "video/mp4"
                }
            ]

            setTimeout(async ()=>{

            await Promise.all(toUploads.map(async (item) => {
                await manageUploadST(item, "us-east-1")
            }))
            resolve();

            }, 5000)


    
        }catch(err){
            console.log(err);
            resolve()
        }



        }else{
            console.log("is not live")
            resolve()
        }
        
    })
}


const username = process.env.username;
const timeout = process.env.timeout;

if (!username) {
    console.log("no username")
    process.exit(0)
    return;
}

if (!timeout) {
    console.log("no timeout")
    process.exit(0)
    return;
}

var tout = parseInt(timeout)

start({
    username:username,
    timeout:tout
}).then(()=>{
    console.log("done")
    process.exit(0)
})