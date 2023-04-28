const fs = require("fs");
const { convertFile } = require("./convertFile");
const {spawn} = require("child_process");


function processDownload({
    url,
    timeout
}) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(">", url, timeout)
            //download m3u8
            const child = spawn("ffmpeg", [
                "-i",
                url,
                "-c",
                "copy",
                "-bsf:a",
                "aac_adtstoasc",
                "-t",
                timeout / 1000,
                "-y",
                "test.mp4"
            ]);

            child.stdout.on("data", (data) => {
                console.log(`stdout: ${data}`);
            });

            child.stderr.on("data", (data) => {
                console.error(`stderr: ${data}`);
            });

    
            child.on("close", async (code) => {
                console.log(`child process exited with code ${code}`);
                resolve({
                    paths:["test.mp4"],
                    status: code
                });
            }
            );
        } catch (e) {
            console.log(e);
            reject(e);
        } finally {

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