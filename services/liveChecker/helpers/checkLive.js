

var isLocal = false;

const checkMultiLive= async (usernames) => {
    let browser = null;
    var toReturn = [];

    if(!isLocal){
        const chromium = require('chrome-aws-lambda');
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
    }else{
        const puppeteer = require('puppeteer');
        browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ignoreHTTPSErrors: true,
        });
    }

    try {
        
        const page = await browser.newPage();
        
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if ([ 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

        for(let i = 0; i < usernames.length; i++){

            try{
            
            await page.goto('https://youtube.com/'+usernames[i]+"/live",{
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
                await page.click("#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.qqtRac > div.VtwTSb > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb");

                await page.waitForTimeout(1000);
                await page.waitForNavigation({
                    waitUntil: "networkidle2"
                });
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
    
            const liveLink = await page.evaluate(() => {
                try{
                   return document.querySelector("#video-title").getAttribute("href")
                }catch(e){
                    return "<none>"
                }
            })

            toReturn.push({
                username: usernames[i],
                isLive: isLive,
                liveLink: liveLink
            })
        }catch(e){
            console.log(e);
        } 
        }
    } catch (error) {
        console.log(error);
    } finally {
        if (browser !== null) {
            // await browser.close();
        }
    }

    return toReturn;
    

}

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


        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

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

        const liveLink = await page.evaluate(() => {
            try{
               return document.querySelector("#video-title").getAttribute("href")
            }catch(e){
                return "<none>"
            }
        })

        if (isLive) {
            toReturn = {
                isLive: true,
                status: "live",
                channel: username,
                liveLink: liveLink,
            };
        } else {
            toReturn = {
                isLive: false,
                status: "not live",
                channel: username,
                liveLink: liveLink,
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

module.exports = {
    checkLIVE,
    checkMultiLive
}