const puppeteer = require("puppeteer");

function getYoutubeLiveUrl(url){
    return new Promise(async (resolve,reject)=>{

        var browser = null;

        try{
            browser = await puppeteer.launch({headless: false});
            var page = await browser.newPage();
            
            await page.goto(url,{
                waitUntil: "networkidle2"
            })

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
    
            const liveLink = await page.evaluate(()=>{
                const url =document.querySelector("link[rel='canonical']").getAttribute("href")
                return url
            })

        

            resolve(liveLink)

        }catch(e){
            resolve("https://www.youtube.com/watch?v=0")
        }
        finally{
            if(browser){
                await browser.close()
            }
        }
    })
}


module.exports = {
    getYoutubeLiveUrl
}