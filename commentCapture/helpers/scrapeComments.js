const puppeteer = require("puppeteer");
const moment = require("moment");
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');


var isCapturingComments = true; // flag variable
// Start Xvfb


var browser = null;

const allComments = [];
const allDonations = [];


async function fetchComments({ url }) {
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--display=:99"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.evaluate(() => {
      document.querySelector("#button > yt-icon").click();
    });

    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      document.querySelector("#items > ytd-menu-service-item-renderer:nth-child(2) > tp-yt-paper-item > yt-formatted-string").click();
    });

    // Set a timeout to stop capturing comments after 10 seconds
    // Create a Promise that resolves when isCapturingComments becomes false
    const commentsPromise = new Promise((resolve, reject) => {
      (async () => {
        while (isCapturingComments) {
          console.log("capturing comments:" + moment().unix());

          const comments = await page.evaluate(() => {
            const comments = [];
            const commentNodes = document.querySelectorAll("yt-live-chat-text-message-renderer");
            for (let i = 0; i < commentNodes.length; i++) {
              comments.push({
                text: commentNodes[i].textContent,
                id: commentNodes[i].id
              });
            }
            return comments;
          });

          const donations = await page.evaluate(() => {
            const donations = [];
            const donationNodes = document.querySelectorAll("yt-live-chat-paid-message-renderer");
            for (let i = 0; i < donationNodes.length; i++) {
              donations.push(donationNodes[i].textContent);
            }
            return donations;
          });

          console.log("capturedComments:", comments.length);
          console.log("capturedDonations:", donations.length);

          comments.forEach(comment => {
            const isDuplicate = allComments.some(c => c.id === comment.id);
            if (!isDuplicate) {
              allComments.push(comment);
            }
          });


          allDonations.push(donations);

          await page.waitForTimeout(5000);
        }

        console.log("done capturing");

        resolve({ allComments, allDonations });
      })().catch({
        allComments: [],
        allDonations: []
      });
    });

    // Return the Promise
    return commentsPromise;
  } catch (e) {
    return {
      allComments: [],
      allDonations: []
    }

  }
}

async function stopCapturingComments() {
  try {
    isCapturingComments = false;
    if (browser) {
      await browser.close();
    }
    return {
     allComments: allComments,
      allDonations: allDonations
    }
  } catch (e) {
    return {
      allComments: allComments,
      allDonations: allDonations
    }
  }
}

module.exports = {
  fetchComments,
  stopCapturingComments
};
