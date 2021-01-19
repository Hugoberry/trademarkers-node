const moment = require('moment');


scraperObject = {
    async scraper(browser){

        

        let data = [];

        let trademark = null;
        let flag = true;
        let offset = 0;
            
            // let url = 'https://tsdr.uspto.gov/#caseNumber='+trademark[0].filing_number+'&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch';
            let url = 'https://tsdr.uspto.gov/#caseNumber=1999445&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch';
            let page = await browser.newPage();
           
            await page.goto(url);

            try {

                let dataValues = {};

                await page.waitForSelector('#docResultsTbody');
                // await page.waitForTimeout(2000);

                let urls = await page.$$eval('#trademarkDocs #docResultsTbody > tr > td > a', links => {

                    links = [
                        links.map(el => el.href),
                        links.map(el => el.text) 
                    ];
                    return links;
                });

                let labelDocs = urls[1];
                let labelLinks = urls[0];

                let documents = [];

                for (let i = 0; i < labelLinks.length; i++) {
                    documents.push({
                        label: labelDocs[i],
                        link: labelLinks[i]
                    });
                }

                

                await page.waitForSelector('#summary');

                let values = await page.$$eval('#summary .value', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });


                
                dataValues.mark = values[1];
                dataValues.serialNumber = values[3];
                dataValues.filingDate = values[4];

                if ( values[5] == 'Yes' || values[5] == 'No' ) {
                    dataValues.filesAsTEASRF = values[5];
                    dataValues.currentTEASRF = values[6];
                } else {
                    dataValues.registrationNumber = values[5];
                    dataValues.registrationDate = values[6];
                }
                

                let statusLabels = await page.$$eval('#summary > div:nth-child(6) .row .key', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                let statusvalues = await page.$$eval('#summary > div:nth-child(6) .row .value', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                let statuses = [];

                for (let i = 0; i < statusvalues.length; i++) {
                    statuses.push({
                        label: statusLabels[i],
                        value: statusvalues[i]
                    });
                }

                let statusLabels7 = await page.$$eval('#summary > div:nth-child(7) .row .key', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                let statusValues7 = await page.$$eval('#summary > div:nth-child(7) .row .value', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                

                for (let i = 0; i < statusValues7.length; i++) {
                    if(statusLabels7[i]) {
                        statuses.push({
                            label: statusLabels7[i],
                            value: statusValues7[i]
                        });

                        // status = returnMysqlStatusValue(statusLabels7[i])
                    }

                }

                // change approach in setting status needs to get the 3rd / in a string
                // TODO 

                let statusString = await page.$$eval('#summary > div:nth-child(5) .row p:first-child', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                let status = 'Filed';

                const statusArr = statusString[0].split('/');
                if ( statusArr.length >= 3 ) {
                    status = statusArr[2];
                    // console.log(statusArr[2]);
                }

                if ( status.trim() == 'Issued and Active' ) {
                    status = "Registered";
                }

                dataValues.status = status;
                
                statuses.forEach(status => {
                    dataValues[returnStatusLabel(status.label)] = formatDate(status.value);
                });

                trademark[0].office_status = status;

                dataValues.documents = documents;

                console.log("dataValues", dataValues);


            } catch(e){
                console.log(e);

            }
            
        

    }
}

module.exports = scraperObject;

