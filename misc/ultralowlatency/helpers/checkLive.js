const puppeteer = require('puppeteer');


const checkMultiLive= async (usernames) => {
    let browser = null;
    var toReturn = [];

    try {
        browser = await puppeteer.launch({
            args:['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            userDataDir: "./data"
        });

        const page = await browser.newPage();
        
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

        for(let i = 0; i < usernames.length; i++){

            try{
            
            await page.goto('https://youtube.com/'+usernames[i],{
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

            console.log("cookie:",isCookie);
    
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

            var viewers = 0;

            try{

                viewers = await page.evaluate(() => {
                    try{
                        return document.querySelector("#metadata-line > span").innerText
                    }catch(e){
                        return 0;
                    }
                })

            }catch(e){
                console.log(e);
            }

            toReturn.push({
                username: usernames[i],
                isLive: isLive,
                liveLink: liveLink,
                viewers: viewers
            })
        }catch(e){
            console.log(e);
        } 
        }
    } catch (error) {
        console.log(error);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    return toReturn;
    

}



module.exports = {
        checkMultiLive
}