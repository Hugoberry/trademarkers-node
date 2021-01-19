const browserObject = require('../crawler/browser');
const scraperController = require('../crawler/pageController');

const cron = require('node-cron');

let moment = require('moment');


exports.usptoCrawl = async function(data) {

    let browserInstance = browserObject.startBrowser(data);

    // Pass the browser instance to the scraper controller
    scraperController(browserInstance)

}