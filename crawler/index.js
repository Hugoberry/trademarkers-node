const browserObject = require('./browser');
const scraperController = require('./pageController');

const cron = require('node-cron');

let moment = require('moment');


console.log('running...');

// console.log( new Date().toISOString() );

let conn = require('./config/DbConnect');
conn.connectToServer( function( err, client ) {

    if (err) console.log(err);

    
    // console.log(client);
    cron.schedule("0 */1 * * * *", () => {

        //Start the browser and create a browser instance
        let browserInstance = browserObject.startBrowser();

        // Pass the browser instance to the scraper controller
        scraperController(browserInstance)

    });

});