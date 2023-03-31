const { launch, getStream } = require("puppeteer-stream");
const fs = require("fs");
const { convertFile } = require("./convertFile");
const pt = require("puppeteer-core")
const puppeteer = require("puppeteer")

function processDownload({
    url,
    timeout
}) {
    return new Promise(async (resolve, reject) => {

        var browser = null;

        console.log(puppeteer.executablePath());

        //if exists test.webm delete it
        if (fs.existsSync(__dirname + "/test.webm")) {
            fs.unlinkSync(__dirname + "/test.webm");
        }

        //if exists test.mp4 delete it
        if (fs.existsSync(__dirname + "/test.mp4")) {
            fs.unlinkSync(__dirname + "/test.mp4");
        }

        try {
            browser = await launch({
                // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                executablePath: puppeteer.executablePath(),
                args:[
                    '--no-sandbox',
                ],
                defaultViewport:{
                    width:1500,
                    height:1000
                }
            });

            const page = await browser.newPage();
            await page.goto("https://banned.video/channel/the-alex-jones-show");
            await page.waitForSelector(".player__button svg");
            var dm = await page.evaluate(() => {
                return {
                    x: document.querySelectorAll(".player__button svg")[2].getBoundingClientRect().x,
                    y: document.querySelectorAll(".player__button svg")[2].getBoundingClientRect().y,
                }
            });

            await page.mouse.click(dm.x, dm.y);

            const stream = await getStream(page, { audio: true, video: true });
            console.log("recording");
            const file = fs.createWriteStream(__dirname + "/test.webm");

            stream.pipe(file);


            setTimeout(async ()=>{
                await stream.destroy();
                file.close();
                browser.close();
                await convertFile(__dirname+"/test.webm", "test.mp4");

                resolve({
                    paths:["test.mp4"],
                    status:"success"
                })

            },timeout)


    
        } catch (e) {
            console.log(e);
            reject(e);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
        
    })
}


// const file = fs.createWriteStream(__dirname + "/test.webm");

// async function getRecordingAlex() {


// 	const page = await browser.newPage();
// 	await page.goto("https://banned.video/channel/the-alex-jones-show");

// 	await page.waitForSelector(".player__button svg");

// 	var dm= await page.evaluate(() => {
// 		return {
// 			x: document.querySelectorAll(".player__button svg")[2].getBoundingClientRect().x,
// 			y: document.querySelectorAll(".player__button svg")[2].getBoundingClientRect().y,
// 		}
// 	});

// 	await page.mouse.click(dm.x, dm.y);

// 	const stream = await getStream(page, { audio: true, video: true });
// 	console.log("recording");

// 	stream.pipe(file);
// 	setTimeout(async () => {
// 		await stream.destroy();
// 		file.close();
// 		console.log("finished");
// 	}, 1000 * 10);
// }

// test();


module.exports = {
    processDownload
}