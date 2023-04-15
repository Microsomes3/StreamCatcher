const {

    scrapeComments,
    stopCapturing

} = require("./comments.js")

const axios = require("axios");

const aws = require("aws-sdk")

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

function start({
    username,
    timeout
}){
    return new Promise(async (resolve,reject)=>{
        const isLive = await getLiveStatusv2("yt-dlp", username)

        if(isLive){

            const getChannelId = await axios.get(`https://www.youtube.com/${username}/live`)

            const videoId = await getLiveIdv2("yt-dlp", username)

            console.log(videoId)
            const comments = await scrapeComments({
                videoId: videoId,
                timeoutSecond: timeout
            })

            console.log("comments", comments.length)



        }else{
            console.log("is not live")
           setTimeout(()=>{
            console.log("try again")
            start({
                username
            })
           },60000)
        }
        
    })
}


start({
    username:"@GriffinGaming",
    timeout:450000
})