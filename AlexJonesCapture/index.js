const { launch, getStream } = require("puppeteer-stream");
const fs = require("fs");
const file = fs.createWriteStream(__dirname + "/test.webm");


async function test() {
	const browser = await launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://banned.video/watch?id=6423625841e41f5e70f45365",{
        waitUntil:"networkidle2"
    });

    await page.waitForTimeout(10000);
    
	const stream = await getStream(page, { audio: true, video: true });
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		file.close();
		console.log("finished");
        browser.close();
	}, 1000 * 60);
}

test();