const pupeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');

const {
  getLiveStatusv2
} = require("./helpers/checkLive")



var isCapturing = true;


function stopCapturing (){
    isCapturing = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var scrapeTime= moment().unix();

var allCommments  = []

var lastAmountOfComments = 0;

var lastFreshUpdate = moment().unix();

function scrubComments(page){
    return new Promise(async (resolve,reject)=>{
  

      const comments = await page.evaluate((moment) => {
        const comments = [];
        const commentNodes = document.querySelectorAll("yt-live-chat-text-message-renderer");
        for (let i = 0; i < commentNodes.length; i++) {
          comments.push({
            author: commentNodes[i].querySelector("#author-name").textContent,
            comment: commentNodes[i].querySelector("#message").textContent,
            id: commentNodes[i].id,
            image: commentNodes[i].querySelector("img").src,
            timestamp: commentNodes[i].querySelector("#timestamp").textContent,
            curtime: moment
          });
        }
        return comments;
      }, moment().unix());


      if(lastAmountOfComments == comments.length){
        console.log("no new comments");
      }else{
        lastFreshUpdate = moment().unix();
        console.log("new comments");
      }

      lastAmountOfComments = comments.length;



      comments.forEach(comment => {
        const isDuplicate = allCommments.some(c => c.id === comment.id);
        if (!isDuplicate) {
            allCommments.push(comment);
        }
      });


      console.log("allComments:", allCommments.length);


      //write to file or update file
      // if comments.json exists, read it and append to it
    
      if(fs.existsSync('comments5.json')){
        //remove
        fs.unlinkSync('comments5.json');
        }

        fs.writeFileSync('comments5.json', JSON.stringify({
            scrapeTime: scrapeTime,
            allComments: allCommments,
        }));

      console.log("scrubbing comments");
        await sleep(5000);
    })
}

function scrapeComments({videoId, timeoutSecond}){
    return new Promise(async (resolve,reject)=>{

        const browser = await pupeteer.launch({
          executablePath: '/usr/bin/chromium-browser',
            headless:false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage();

        await page.goto(`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`, {waitUntil: 'networkidle2'});


        const timeoutMillisecondsToSeconds = timeoutSecond * 1000;

        console.log(timeoutMillisecondsToSeconds)

        setTimeout(()=>{
          console.log("timeout");
            isCapturing = false;
        },timeoutMillisecondsToSeconds)


            

        while(isCapturing){
            scrubComments(page);
            await sleep(5000);
        }

        await browser.close();
        

        console.log("done capturing comments");

        console.log("allCommments", allCommments.length);

        resolve(allCommments)
    })
}

module.exports = {
    scrapeComments,
    stopCapturing
}