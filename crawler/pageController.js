const pageScraper = require('./pageScraper');

async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        await pageScraper.scraper(browser);

        // browser.close();

    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)