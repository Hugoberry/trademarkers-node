const mysql = require('mysql');
const moment = require('moment');
let ObjectID = require('mongodb').ObjectID;

// MYSQL
const connection = mysql.createConnection({
    host     : 'tmsql01.cnobnjjh1a2c.us-west-1.rds.amazonaws.com',
	user     : 'tmwebdba',
	password : 'KaVGZ4XDxehv',
	database : 'trademarkersweb'
});

let conn = require('../config/DbConnect');

//   let db = client.connect();

scraperObject = {
    async scraper(browser, serial){

        

        let data = [];

        let trademark = null;
        let isNew = true;
        let updateId = null;
        console.log('=================== STARTING BROWSER ===================');

        console.log(serial);
        // if ( trademark && trademark[0] && trademark[0].filing_number != 0 ) {
            
            // console.log("CHECKING SERIAL NUMBER: " + trademark[0].filing_number + " | ID: " + trademark[0].id + "......" );

            let url = 'https://tsdr.uspto.gov/#caseNumber='+serial+'&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch';
            // let url = 'https://tsdr.uspto.gov/#caseNumber=88799623&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch';
            let page = await browser.newPage();
            let dataValues = {};
            console.log("url => ", url);
            await page.goto(url);

            try {

                
                // Wait for the required DOM to be rendered
                await page.waitForSelector('#docResultsTbody');

                let urls = await page.$$eval('#trademarkDocs #docResultsTbody > tr > td > a', links => {

                    links = [
                        links.map(el => el.href),
                        links.map(el => el.text) 
                    ];
                    return links;
                });

                let labelDocs = urls[1];
                let labelLinks = urls[0];

                let docdates = await page.$$eval('#trademarkDocs #docResultsTbody > tr > td:nth-child(2)', datesLinks => {

                   
                    return datesLinks.map(el => el.innerHTML.trim());
                });


                let documents = [];

                for (let i = 0; i < labelLinks.length; i++) {
                    documents.push({
                        dateFormatted: docdates[i],
                        date: formatDate(docdates[i]),
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
                }

                if ( status.trim() == 'Issued and Active' ) {
                    status = "Registered";
                }

                dataValues.status = status;
                
                statuses.forEach(status => {
                    dataValues[returnStatusLabel(status.label)] = formatDate(status.value);
                });

   

                dataValues.documents = documents;

                dataValues.lastCrawled = moment().format('YYYY-MM-DD')

                let classArr = [];
                dataValues.class = classArr

                await page.waitForSelector('#data_container');
                // get tm holder
                let holderLabel = await page.$$eval('#data_container  > div:nth-child(5) .toggle_container #relatedProp-section .key', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                let holderValue = await page.$$eval('#data_container  > div:nth-child(5) .toggle_container #relatedProp-section .value', data => {

                    value = data.map(el => el.innerHTML.trim()) 
                    return value;

                });

                for (let i = 0; i < holderLabel.length; i++) {
                    if(holderLabel[i]) {

                        dataValues[returnStatusLabel(holderLabel[i])] = holderValue[i].replace(/<\/?[^>]+(>|$)/g, "");
                    }

                }
                // console.log("holder",holderLabel);
       
                addTrademarkMongo(dataValues);

                return dataValues;
                

            } catch(e){
                console.log("error ",e);

                return null;

            }
            
        // }

    }
}

module.exports = scraperObject;


function getTrademark(offset) {

    return new Promise(function(resolve, reject) {

        let date = moment().subtract(18, 'months').format('YYYY-MM-DD');

        // console.log('now', date);
        let query = `SELECT *
                    FROM trademarks
                    WHERE filing_number IS NOT NULL 
                    AND filing_number <> 0
                    GROUP BY filing_number
                    LIMIT 1 OFFSET ${offset}`;

        connection.query(query,function(err,res,fields) {
            if (err) {
                reject(err);
        } else {
                resolve(res);
        }
        });
    });
}

function updateMysqlTrademark(data) {

    return new Promise(function(resolve, reject) {

        let date = moment().subtract(9, 'months').format('YYYY-MM-DD');

        // console.log('now', date);
        let query = `UPDATE trademarks
                    SET
                    office_status='${data.status}', 
                    updated_at = '${moment().format("YYYY-MM-DD HH:mm:ss")}'
                    WHERE id=${data.mysqlID}`;

        connection.query(query,function(err,res,fields) {
            if (err) {
                reject(err);
        } else {
                resolve(res);
        }
        });
    });
}

function returnStatusLabel(label) {
    switch(label) {
        case 'Status:':
            return 'statusDescription';
        break;

        case 'Status Date:':
            return 'statusDate';
        break;

        case 'Publication Date:':
            return 'publicationDate';
        break;

        case 'Notice of Allowance Date:':
            return 'noticeOfAllowanceDate';
        break;

        case 'Date Abandoned:':
            return 'abandonedDate';
        break;

        case 'Date Cancelled:':
            return 'cancelledDate';
        break;

        case 'Owner Name:':
            return 'ownerName';
        break;

        case 'Owner Address:':
            return 'ownerAddress';
        break;

        case 'Legal Entity Type:':
            return 'legalEntityType';
        break;

        case 'Citizenship:':
            return 'citizenship';
        break;

        default:
            return label;
        break;
    }
}

function returnMysqlStatusValue(label) {
    switch(label) {




        case 'Date Abandoned:':
            return 'Abandoned';
        break;

        case 'Date Cancelled:':
            return 'Cancelled';
        break;

        default:
            return 'Registered';
        break;


        // 'Received'
        // 'Filed'
        // 'Registered'
        // 'Under Examinations'
        // 'Published'
        // 'Under Opposition'
        // 'Under Cancellation'
        // 'For Renewal'
        // 'Study Completed'
        // 'Cancelled'
        // 'Withdrawn'
        // 'Refused'
        // 'Abandoned'
    }
}

async function getTrademarkMongo(trademark) {

    // let db = await client.connect();

    

    return new Promise(function(resolve, reject) {

        // let query = { mysqlID: trademark.id };
			
        // conn.getDb().collection('tm_trademarks').find(query).toArray(function(err, result) {
					
        //     if (err) {
        //         reject(err);
        //     } else {
        //         resolve(result);
        //     }

        // });
    });
}

async function addTrademarkMongo(trademark) {

    return new Promise(function(resolve, reject) {
        
        
        	// 		// let db = conn.getDb();

        conn.getDb().collection('tm_trademarks').findOne({
            serialNumber: trademark.serialNumber
        }, 
        function(err, result) {
            if (err) {
                reject(err);
            } else {
                console.log("result => ", result);
                if (!result) {
                    conn.getDb().collection('tm_trademarks').insertOne(trademark, 
                        function(err, res2) {
                            if (err) {
                                reject(err);
                            }
                            console.log('added new record');
                            resolve(res2);
                        }
                    );
                } else {

                    let query = { serialNumber: trademark.serialNumber };
                    // console.log(trademark);
                    conn.getDb().collection('tm_trademarks').updateOne(query,  {$set:{...trademark}}, function(err, res) {
                        if (err) {
                            console.log('Error updating user: ' + err);
                            // res.send({'error':'An error has occurred'});
                        } else {
                            console.log('updated');
                            // res.send(result);
                            resolve(res);
                        }
                    });

                }

                resolve(result);
            }
        });

    });
        
}

function updateTrademarkMongo(id, data) {

    // let query = { _id: ObjectID(id) };

    // conn.getDb().collection('tm_trademarks').updateOne(query,  {$set:data}, function(err, result) {
    //     if (err) {
    //         console.log('Error updating trademark contents ' + err);
    //         // res.send({'error':'An error has occurred'});
    //     } else {
    //         console.log('success update');
    //     }
    // });
        
}

function formatDate(date) {

    
    try{

        let testdate = new Date(date).toISOString();
        // console.log('date',date);
        let thisDate = moment(testdate);
        // console.log('date accepted');
        return thisDate.format('YYMMDD');

    } catch(e) {
        // console.log('x');
        return date;
    }
        

    
    // console.log('date x');

    return date;

}

function formatDateTimestamp(date) {

    let testdate = new Date(date).toISOString();
    let thisDate = moment(testdate);
    // console.log(thisDate.format('YYMMDD'));

    return thisDate.format("YYYY-MM-DD HH:mm:ss");

}

