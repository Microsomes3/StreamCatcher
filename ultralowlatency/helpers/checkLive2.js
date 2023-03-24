const { Cluster } = require('puppeteer-cluster');

(async () => {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 6,
      headless: false,
    });
  
    await cluster.task(async ({ page, data: url }) => {
        console.log("url:",url);
      await page.goto(url,{
        waitUntil: "networkidle2"
      });

      const title = await page.title();

      console.log(title);
      
    });
  
    cluster.queue('http://www.google.com/');
    cluster.queue('http://www.wikipedia.org/');
    cluster.queue('http://www.wikipedia.org/');
    cluster.queue('http://www.wikipedia.org/');
    cluster.queue('http://www.wikipedia.org/');
    cluster.queue('http://www.wikipedia.org/');
    // many more pages
  
    await cluster.idle();
    await cluster.close();
  })();