const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const puppeteer = require('puppeteer');
const axios = require('axios');
const aws = require('aws-sdk');
const fs = require('fs');
const moment = require('moment');
const {spawn} = require('child_process');
const { getVideoId } = require("./helpers.js")

//spawn xvfb

const xvfb = spawn('Xvfb', [':99', '-screen', '0', '1280x720x24', '-ac', '-nolisten', 'tcp']);


const s3 = new aws.S3({
region:"eu-west-1",
});

function getLiveStatus(username){
    return new Promise(async (resolve,reject)=>{
        const a = await axios.get("https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/getLiveStatus/"+username);
        resolve(a.data);
    })
}


function monitorAndResolve(username,r,recorder,timeoutSeconds){

    const l = setTimeout(async () => {
        await recorder.stop();
        clearInterval(c);
        r();
    },timeoutSeconds)


    const c =setInterval(async () => {
        console.log("checking live")
        const videoId =await getVideoId(username);
        console.log(videoId)
        if(videoId==""){
            await recorder.stop();
            clearTimeout(l);
            clearInterval(c);
            r();
        }
    },60000)

}

function recordPage(username,page,timeoutSeconds){
    return new Promise(async(resolve,reject)=>{

        const recorder = new PuppeteerScreenRecorder(page);
        await recorder.start('simple.mp4'); // supports extension - mp4, avi, webm and mov


        monitorAndResolve(username,resolve,recorder,timeoutSeconds);
        

    })
}

async function init(username,timeout, jobId){

    const videoId  =await getVideoId(username);

    if(videoId==""){
        return "Not live"
    }


    const browser = await puppeteer.launch({
        headless: false,
        viewport: {
            width: 500,
            height: null,
        },
        args:[
            '--no-sandbox',
        ]
    });
    const page = await browser.newPage();

    await page.setViewport({
        width: 500,
        height: 800,
    });

    const vidId = await getVideoId(username);

    console.log(vidId)

    await page.goto('https://www.youtube.com/live_chat?is_popout=1&v='+vidId,{waitUntil: 'networkidle2'});


    try{
        page.evaluate(()=>{
            document.querySelector("#label-text").click()
        })
    }catch(err){}

    await page.waitForTimeout(1000);

    try{
              document.querySelector("#menu > a:nth-child(2) > tp-yt-paper-item").click()

    }catch(err){}
    await page.waitForTimeout(1000);



    const chatcss="https://scrapes69.s3.eu-west-1.amazonaws.com/chat.css"

    await page.addStyleTag({ url: chatcss });

    await recordPage(username,page,timeout*1000);

    await browser.close();


    const freader = await fs.createReadStream('simple.mp4');

    const params = {
        Bucket: 'griffin-record-input',
        Key: jobId+"_comments_"+username+'.mp4',
        Body: freader,
        ACL: 'public-read',
        ContentType: 'video/mp4'
    };

    const res = await s3.upload(params).promise();

    return res.Location;

}


console.log(process.env.username)

init(process.env.username,parseInt(process.env.timeout), process.env.jobId).then((res)=>{
    console.log(res);
    xvfb.kill();
})