const chromium = require('chrome-aws-lambda');

const checkLIVE = async (username) => {
    let browser = null;
    var toReturn = null;

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        let page = await browser.newPage();

        await page.goto('https://youtube.com/'+username,{
            waitUntil: "networkidle2"
        });

        const isCookie = await page.evaluate(() => {
            try {
                if (document.querySelector(".SGW9xe").innerText == "Before you continue to YouTube") {
                    return true;
                }
            } catch (e) {
                return false;
            }
        });

        if (isCookie) {
            await page.click(".SGW9xe");
        }

        const isLive = await page.evaluate(() => {
            try{
            var live = false;
            document.querySelectorAll("#metadata-line > span").forEach(vi => { if (vi.innerText.includes("watching")) { live = true } });
            return live;
            }catch(e){
                return false;
            }
        })

        if (isLive) {
            toReturn = {
                isLive: true,
                status: "live",
                channel: username,
            };
        } else {
            toReturn = {
                isLive: false,
                status: "not live",
                channel: username,
            };
        }

        await page.close();
        await browser.close();

        return toReturn;
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports.checkLIVE = checkLIVE;