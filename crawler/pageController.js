const pageScraper = require('./pageScraper');
async function scrape(browserInstance, serial){
    let browser;
    try{
        browser = await browserInstance;
        // console.log('open', serial);
        await pageScraper.scraper(browser, serial);

        browser.close();

    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, serial) => scrape(browserInstance, serial)