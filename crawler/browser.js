const puppeteer = require('puppeteer');

async function startBrowser(){
    let browser;
    try {
        console.log("Opening the browser......");

        var ENV = process.env.ENVIRONMENT || 'prod'; 
        console.log(ENV);

        if ( ENV === "prod" ) {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                'ignoreHTTPSErrors': true,
                executablePath: '/usr/bin/chromium-browser'
            });
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                'ignoreHTTPSErrors': true
            });
        }
        
    } catch (err) {
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
}

module.exports = {
    startBrowser
};