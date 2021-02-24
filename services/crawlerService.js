var helpers = require('../helpers');

const browserObject = require('../crawler/browser');
const scraperController = require('../crawler/pageController');

const cron = require('node-cron');

let moment = require('moment');


exports.fetchTsdr = async function(serial) {

  console.log('1 => ',serial);
  let browserInstance = browserObject.startBrowser();

  // Pass the browser instance to the scraper controller
  let scrape = await scraperController(browserInstance, serial)

}