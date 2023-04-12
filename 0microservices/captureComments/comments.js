const pupeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');

var isCapturing = true;


function stopCapturing (){
    isCapturing = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var scrapeTime= moment().unix();

var allCommments  = []

function scrubComments(page){
    return new Promise(async (resolve,reject)=>{
      //sleep for 5 seconds

      const comments = await page.evaluate(() => {
        const comments = [];
        const commentNodes = document.querySelectorAll("yt-live-chat-text-message-renderer");
        for (let i = 0; i < commentNodes.length; i++) {
          comments.push({
            text: commentNodes[i].textContent,
            id: commentNodes[i].id,
            image: commentNodes[i].querySelector("img").src,
          });
        }
        return comments;
      });


      comments.forEach(comment => {
        const isDuplicate = allCommments.some(c => c.id === comment.id);
        if (!isDuplicate) {
            allCommments.push(comment);
        }
      });


      console.log("allComments:", allCommments.length);


      //write to file or update file
      // if comments.json exists, read it and append to it
    
      if(fs.existsSync('comments3.json')){
        //remove
        fs.unlinkSync('comments3.json');
        }

        fs.writeFileSync('comments3.json', JSON.stringify({
            scrapeTime: scrapeTime,
            allComments: allCommments,
        }));

      console.log("scrubbing comments");
        await sleep(5000);
    })
}

function scrapeComments({url}){
    return new Promise(async (resolve,reject)=>{
        const executablePathMacChromeGoogle = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

        const browser = await pupeteer.launch({
            executablePath: executablePathMacChromeGoogle,
            headless:false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage();

        await page.goto(url, {waitUntil: 'networkidle2'});

        while(isCapturing){
            scrubComments(page);
            await sleep(5000);
        }

        console.log("done capturing comments");
    })
}


scrapeComments({
    url:"https://www.youtube.com/live_chat?is_popout=1&v=hnYYwQC70go"
})




module.exports = {
    scrapeComments,
    stopCapturing
}