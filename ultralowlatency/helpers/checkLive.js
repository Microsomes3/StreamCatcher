const puppeteer = require('puppeteer');


const checkMultiLive= async (usernames) => {
    let browser = null;
    var toReturn = [];

    try {
        browser = await puppeteer.launch({
            args:['--no-sandbox', '--disable-setuid-sandbox'],
            headless: false
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
            await browser.close();
        }
    }

    return toReturn;
    

}



module.exports = {
        checkMultiLive
}