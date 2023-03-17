
const { spawn } = require('child_process');

const puppeteer = require('puppeteer');


(async()=>{

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.goto("https://example.com");

    await page.screenshot({path: 'example.png'});
    await browser.close();

})()

console.log("hello:"+process.env.task)

setTimeout(function(){
    console.log("hello");
}, 1000);