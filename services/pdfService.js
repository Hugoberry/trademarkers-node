const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const fs  = require('fs');
const moment = require('moment');


const rpoGeneratedPdf = require('../repositories/generatedPdf');
const rpoSenders = require('../repositories/senders');
const rpoOrders = require('../repositories/orders');
const rpoUsers = require('../repositories/usersMongo');

exports.generate = async function(data) {


    let now = Date.now();
    let pdfName = now +'-'+ data.trademark_number + '.pdf';

    let sender = await rpoSenders.getSenderById(data.sender);

    const PDFDocument = require('pdfkit');

    // Create a document
    const doc = new PDFDocument;
    var stream = doc.pipe(blobStream());

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream('public/pdf/'+ pdfName));

    doc.image ('public/uploads/'+sender[0].logo, 330, 20, { "width": 250 });

    doc.moveTo (30, 68);
    doc.lineTo (500,68);
    doc.stroke ();

    doc.font('public/fonts/Franklin Gothic Medium Regular.ttf')
    .fontSize(13)
    .text(`${sender[0].name} | ${sender[0].address} | ${sender[0].code} ${sender[0].state}`, 31, 48);

    doc.fontSize (8.5);
    doc.text (`${sender[0].name} | ${sender[0].address} | ${sender[0].code} ${sender[0].state} | ${sender[0].country}`, 69, 146);
    doc.moveTo (64, 156);
    doc.lineTo (330, 156);
    doc.stroke ();
    doc.moveTo (30,155);
    doc.fontSize (12);
    doc.text ('European Union Intellectual Property Office', 75, 175);
    doc.text ('Av. de Europa, 4');
    doc.text ('E-03008 Alicante');
    doc.text ('Espana');
    doc.text (`${sender[0].state}, ${moment(Date.now()).format('MMM D, YYYY')}`, 375, 275);
    doc.text (`European Union Trademark Application No. ${data.trademark_number} "${data.trademark_name}"`, 78, 335);
    doc.text (`Opposition ${data.opposition_number} by ${data.opponent}`);
    doc.moveDown ();

    if (data.opposition1) {
        doc.text (data.opposition1);
    }
    if (data.opposition2) {
        doc.text (data.opposition2);
    }
    if (data.opposition3) {
        doc.text (data.opposition3);
    }
    if (data.opposition4) {
        doc.text (data.opposition4);
    }

    doc.moveDown ();
    doc.text ('Dear Sirs, ');
    doc.moveDown ();
    doc.text ('In the proceedings referenced above we respectfully request an extension of present deadlines by at least an additional 2 months. ');
    doc.moveDown ();
    doc.text ('Due to the present public health crisis known as the “Covid Pandemic”, our operations are currently forced to work with skeleton staff, and we will require additional time to coordinate the necessary research to evaluate, and respond to, the subject opposition. ');
    doc.moveDown ();
    doc.text ('As current developments point to a worsening of the crisis rather than improvement, and a return to normalcy is uncertain, we would appreciate if the office could grant an extension for another 4 months.');
    doc.moveDown ();
    doc.moveDown ();
    doc.text ('Respectfully, ');
    doc.moveDown ();
    doc.image ('public/uploads/'+sender[0].signature, { "fit": [160, 999], "align": "left" });

    

    doc.end ();

    


    // STORE RECORD FOR FUTURE RETRIEVAL
    rpoGeneratedPdf.putGeneratedPdf({
        office: 'EUIPO',
        type: 'opposition',
        url: pdfName,
        created: now,
        name: data.trademark_name
    });
    
    return pdfName;
}



exports.generateInvoice = async function(orderNumber) {

    try {

        let orders = await rpoOrders.findOrderNumber(orderNumber);
        let users = await rpoUsers.getByIdM(orders[0].userId);

        if (orders.length > 0) {

            if ( !orders[0].user  ) {
                orders[0].user = users[0]
            }

            let path = './public/pdf/'+orders[0].orderNumber.toLowerCase()+'.pdf'

            if (!fs.existsSync(path) || true ) {

                console.log('exec');

                let now = Date.now();
                let pdfName = orders[0].orderNumber.toLowerCase()+'.pdf';


                const PDFDocument = require('pdfkit');

                // Create a document
                const doc = new PDFDocument;
                var stream = doc.pipe(blobStream());

                let leftSpace = 50;
                let verticalSpace = 90;

                // Pipe its output somewhere, like to a file or HTTP response
                // See below for browser usage
                doc.pipe(fs.createWriteStream('public/pdf/'+ pdfName));

                doc.image ('public/images/pdf-icon.png', 400, -10, { "width": 180 });


                doc.image ('public/images/trademarkers.png', leftSpace, verticalSpace, { "width": 180 });

                verticalSpace += 50

                doc.font('Helvetica-Bold')
                .fontSize(13)
                .text(`| Bill To. ${orders[0].user.name}`, leftSpace, verticalSpace);

                doc.fontSize (8);


                let email='', address=''
           
                if ( orders[0].charge.metadata ) {
                    email = orders[0].charge.receipt_email
                    address = orders[0].charge.metadata.customerAddress
                } else if ( orders[0].user ) {
            
                    email = orders[0].user.email ? orders[0].user.email : email
                    address = orders[0].user.address ? orders[0].user.address : address
                }
              
                verticalSpace += 20
                doc.text (`E, ${email}`, leftSpace + 50, verticalSpace );
                
                if (address) {
                    verticalSpace += 15
                    doc.text (`A, ${address}`, leftSpace + 50, verticalSpace );

                }
                
                doc.fontSize (32);
                doc.fillColor('#000').text ('INVOICE', leftSpace + 350, verticalSpace - 60 );

                doc.fontSize (8.5);
                verticalSpace += 30
                doc.fillColor('#000')
                doc.moveDown ();


                // ITEM HEAD

                verticalSpace += 20 

                generateTableRow(
                    doc,
                    verticalSpace,
                    "Service",
                    "Description",
                    "Country",
                    "Classes",
                    "Price",
                    "QTY",
                    "TOTAL"
                );

                // ITEM HEAD END
                // let items 

                let totalAmount = 0;
                let totalDiscount = 0;

                if ( orders[0].cartItems ) {
                    
                    for(let i = 0; i < orders[0].cartItems.length; i++) {
                    // ITEM BODY
                    verticalSpace += 30
                    generateHr(doc, verticalSpace);
                    doc.font("Helvetica");

                    verticalSpace += 10
                    // add linebreak after 25 char on description TO DO
                    let tmType = 'Design-Only or Stylized Word-Only (Figurative)'

                    if (orders[0].cartItems[i].type == "lword") {
                        tmType = 'Combined Word \nand Design:\n ' + orders[0].cartItems[i].word_mark
                    } else if ( orders[0].cartItems[i].type == "word" ) {
                        tmType = 'Word-Only: \n' + orders[0].cartItems[i].word_mark
                    } else {
                        tmType = 'Design-Only or Stylized \nWord-Only (Figurative):\n ' + orders[0].cartItems[i].word_mark
                    }
                    // let result = ""
                    // while (tmType.length > 0) {
                    //     result += tmType.substring(0, 24) + '\n';
                    //     tmType = tmType.substring(24);
                    // }

                    // console.log("ressss",result);

                    // var typeFormatted = tmType.replace(/(.{25})/g,"$")

                    // console.log("test ", typeFormatted);
                    totalAmount += orders[0].cartItems[i].price
                    totalDiscount += orders[0].cartItems[i].discountAmount ? orders[0].cartItems[i].discountAmount : 0
                    generateTableRow(
                        doc,
                        verticalSpace,
                        "TM "+orders[0].cartItems[i].serviceType.toUpperCase(),
                        tmType,
                        orders[0].cartItems[i].country.name,
                        orders[0].cartItems[i].class,
                        "$"+orders[0].cartItems[i].price,
                        1,
                        "$"+orders[0].cartItems[i].price
                    );

                    if (orders[0].cartItems[i].type == "lword") {
                        verticalSpace += 10
                    } else if ( orders[0].cartItems[i].type == "word" ) {
                        verticalSpace += 0
                    } else {
                        verticalSpace += 10
                    }

                    

                    // ITEM BODY END
                    }

                    verticalSpace += 30
                    generateHr(doc, verticalSpace);

                }

                if ( orders[0].cartItems.length < 4 ) {
                    verticalSpace += (4 - orders[0].cartItems.length) * 70;
                }
          

                // ITEM BODY END



                verticalSpace += 30

                doc.font("Helvetica-Bold");
                doc.fontSize(13).text ('PAYMENT METHOD', leftSpace , verticalSpace);

                doc.fontSize(13).underline( leftSpace + 300, 15 ,200 , verticalSpace, { color: '#000' }).text ('SUBTOTAL:                $'+totalAmount, leftSpace + 300, verticalSpace);
                doc.fontSize(13).underline( leftSpace + 300, 35 ,200 , verticalSpace, { color: '#000' }).text ('DISCOUNT:                $'+totalDiscount, leftSpace + 300, verticalSpace + 20);
                doc.fontSize(13).underline( leftSpace + 300, 55 ,200 , verticalSpace, { color: '#000' }).text ('TOTAL:                       $'+(totalAmount-totalDiscount), leftSpace + 300 , verticalSpace + 40);


                doc.font("Helvetica");
                doc.fillColor('#666').fontSize(8.5).text ('BANK: JP Morgan Chase', leftSpace , verticalSpace+=20);
                doc.fillColor('#666').fontSize(8.5).text ('SWIFT: CHASUS33', leftSpace , verticalSpace+=15);
                doc.fillColor('#666').fontSize(8.5).text ('Account No: 55964-0730', leftSpace , verticalSpace+=15);
                doc.fillColor('#666').fontSize(8.5).text ('Routing No: 267084131', leftSpace , verticalSpace+=15);


                verticalSpace += 30
                doc.fillColor('#000')
                doc.font("Helvetica-Bold");
                doc.fontSize(13).text ('NOTES', leftSpace , verticalSpace);

                doc.fillColor('#666')
                doc.font("Helvetica");
                doc.fontSize(8.5)
                doc.moveDown ();
                
                doc.text ('Please specify your invoice number in your payment and correspondence');



                doc
                .fontSize(10)
                .text('Trademarkers LLC', 100, 710, {width:"33%",align: "center" })
                .text('Bank Address', 250, 710, {width:"33%",align: "center" })
                .text('JP Morgan Chase', 380, 710, {width:"33%",align: "center" })

                doc
                .fontSize(10)
                .text('45 Essex Street, Suite 202', 100, 725, {width:"33%",align: "center" })
                .text('401 Madison Ave.', 250, 725, {width:"33%",align: "center" })
                .text('SWIFT CHASUS33', 380, 725, {width:"33%",align: "center" })

                doc
                .fontSize(10)
                .text('Millburn NJ 07041', 100, 740, {width:"33%",align: "center" })
                .text('New York, NY 10017', 250, 740, {width:"33%",align: "center" })
                .text('ACCOUNT NO: 55964-0730', 380, 740, {width:"33%",align: "center" })

                doc
                .fontSize(10)
                .text('', 100, 755, {width:"33%",align: "center" })
                .text('', 250, 755, {width:"33%",align: "center" })
                .text('ROUTING NO: 267084131', 380, 755, {width:"33%",align: "center" })


                doc.end ();

                
                return true;

                // STORE RECORD FOR FUTURE RETRIEVAL
                // rpoGeneratedPdf.putGeneratedPdf({
                //     office: 'EUIPO',
                //     type: 'opposition',
                //     url: pdfName,
                //     created: now,
                //     name: 'asdasd'
                // });
    
            }
        }

        return false;

        

    } catch(err) {

        return false;
        console.error(err)
    }

    
}

exports.generateOldInvoice = async function(orderNumber) {
// console.log("gen old invoice");
    try {

        let orders = await rpoOrders.findOrderNumber(orderNumber);
        let users = await rpoUsers.getByIdM(orders[0].userId);

        if (orders.length > 0) {

            if ( !orders[0].user  ) {
                orders[0].user = users[0]
            }

            let path = './public/pdf/'+orders[0].orderNumber.toLowerCase()+'.pdf'

            if (!fs.existsSync(path)) {

                console.log('exec', orders[0]);

                let now = Date.now();
                let pdfName = orders[0].orderNumber.toLowerCase()+'.pdf';


                const PDFDocument = require('pdfkit');

                // Create a document
                const doc = new PDFDocument;
                var stream = doc.pipe(blobStream());

                let leftSpace = 50;
                let verticalSpace = 90;

                // Pipe its output somewhere, like to a file or HTTP response
                // See below for browser usage
                doc.pipe(fs.createWriteStream('public/pdf/'+ pdfName));

                doc.image ('public/images/pdf-icon.png', 400, -10, { "width": 180 });


                doc.image ('public/images/trademarkers.png', leftSpace, verticalSpace, { "width": 180 });

                verticalSpace += 50

                doc.font('Helvetica-Bold')
                .fontSize(13)
                .text(`| Bill To. ${orders[0].user.name}`, leftSpace, verticalSpace);

                doc.fontSize (8.5);


                let email=orders[0].user.email, address=orders[0].user.address



                // if ( orders[0].charge.metadata ) {
                //     email = orders[0].charge.receipt_email
                //     address = orders[0].charge.metadata.customerAddress
                // }

                verticalSpace += 20
                doc.text (`E, ${email}`, leftSpace + 50, verticalSpace );
                
                if (address) {
                    verticalSpace += 15
                    doc.text (`A, ${address}`, leftSpace + 50, verticalSpace );

                }
                
                doc.fontSize (32);
                doc.fillColor('#000').text ('INVOICE', leftSpace + 350, verticalSpace - 60 );

                doc.fontSize (8.5);
                verticalSpace += 30
                doc.fillColor('#000')
                doc.moveDown ();


                // ITEM HEAD

                verticalSpace += 20 

                generateTableRow(
                    doc,
                    verticalSpace,
                    "Service",
                    "Description",
                    "Country",
                    "Classes",
                    "Price",
                    "QTY",
                    "TOTAL"
                );

                // ITEM HEAD END
                // let items 

                let totalAmount = 0;
                let totalDiscount = 0;

                if ( orders[0].cartItems ) {
                    
                    for(let i = 0; i < orders[0].cartItems.length; i++) {
                    // ITEM BODY
                    verticalSpace += 20
                    generateHr(doc, verticalSpace);
                    doc.font("Helvetica");

                    verticalSpace += 10
                    // add linebreak after 25 char on description TO DO
                    let tmType = 'Design-Only or Stylized Word-Only (Figurative)'

                    if (orders[0].cartItems[i].type == "Combined Word and Design") {
                        tmType = 'Combined Word and \nDesign - ' + orders[0].cartItems[i].name
                    } else if ( orders[0].cartItems[i].type == "Word-Only" ) {
                        tmType = 'Word-Only - \n' + orders[0].cartItems[i].name
                    } else {
                        tmType = 'Design-Only or Stylized \nWord-Only (Figurative) - ' + orders[0].cartItems[i].name
                    }

                    tmType = orders[0].cartItems[i].type + " - " + orders[0].cartItems[i].name

                    totalAmount += orders[0].cartItems[i].price ? orders[0].cartItems[i].price : orders[0].cartItems[i].amount
                    totalDiscount += orders[0].cartItems[i].discount ? orders[0].cartItems[i].discount : 0
                    generateTableRow(
                        doc,
                        verticalSpace,
                        orders[0].cartItems[i].service,
                        tmType,
                        orders[0].cartItems[i].office,
                        orders[0].cartItems[i].classes,
                        "$"+orders[0].cartItems[i].amount,
                        1,
                        "$"+orders[0].cartItems[i].amount
                    );

                    verticalSpace += 20
                    generateHr(doc, verticalSpace);

                    // ITEM BODY END
                    }

                }
          

                // ITEM BODY END



                verticalSpace += 30

                doc.font("Helvetica-Bold");
                doc.fontSize(13).text ('PAYMENT METHOD', leftSpace , verticalSpace);

                doc.fontSize(13).underline( leftSpace + 300, 15 ,200 , verticalSpace, { color: '#000' }).text ('SUBTOTAL:                $'+totalAmount, leftSpace + 300, verticalSpace);
                doc.fontSize(13).underline( leftSpace + 300, 35 ,200 , verticalSpace, { color: '#000' }).text ('DISCOUNT:                $'+totalDiscount, leftSpace + 300, verticalSpace + 20);
                doc.fontSize(13).underline( leftSpace + 300, 55 ,200 , verticalSpace, { color: '#000' }).text ('TOTAL:                       $'+(totalAmount-totalDiscount), leftSpace + 300 , verticalSpace + 40);


                doc.font("Helvetica");
                doc.fillColor('#666').fontSize(8.5).text ('BANK: JP Morgan Chase', leftSpace , verticalSpace+=20);
                doc.fillColor('#666').fontSize(8.5).text ('SWIFT: CHASUS33', leftSpace , verticalSpace+=15);
                doc.fillColor('#666').fontSize(8.5).text ('Account No: 55964-0730', leftSpace , verticalSpace+=15);
                doc.fillColor('#666').fontSize(8.5).text ('Routing No: 267084131', leftSpace , verticalSpace+=15);


                verticalSpace += 30
                doc.fillColor('#000')
                doc.font("Helvetica-Bold");
                doc.fontSize(13).text ('NOTES', leftSpace , verticalSpace);

                doc.fillColor('#666')
                doc.font("Helvetica");
                doc.fontSize(8.5)
                doc.moveDown ();
                
                doc.text ('Please specify your invoice number in your payment and correspondence');



                doc
                .fontSize(10)
                .text('Trademarkers LLC', 100, 710, {width:"33%",align: "center" })
                .text('Bank Address', 250, 710, {width:"33%",align: "center" })
                .text('JP Morgan Chase', 380, 710, {width:"33%",align: "center" })

                doc
                .fontSize(10)
                .text('45 Essex Street, Suite 202', 100, 725, {width:"33%",align: "center" })
                .text('401 Madison Ave.', 250, 725, {width:"33%",align: "center" })
                .text('SWIFT CHASUS33', 380, 725, {width:"33%",align: "center" })

                doc
                .fontSize(10)
                .text('Millburn NJ 07041', 100, 740, {width:"33%",align: "center" })
                .text('New York, NY 10017', 250, 740, {width:"33%",align: "center" })
                .text('ACCOUNT NO: 55964-0730', 380, 740, {width:"33%",align: "center" })

                doc
                .fontSize(10)
                .text('', 100, 755, {width:"33%",align: "center" })
                .text('', 250, 755, {width:"33%",align: "center" })
                .text('ROUTING NO: 267084131', 380, 755, {width:"33%",align: "center" })


                doc.end ();

                
                return true;

                // STORE RECORD FOR FUTURE RETRIEVAL
                // rpoGeneratedPdf.putGeneratedPdf({
                //     office: 'EUIPO',
                //     type: 'opposition',
                //     url: pdfName,
                //     created: now,
                //     name: 'asdasd'
                // });
    
            }
        }

        return false;

        

    } catch(err) {

        return false;
        console.error(err)
    }

    
}

exports.generateCustomInvoice = async function(orderNumber) {
    console.log("gen custom invoice");
        try {
    
            let orders = await rpoOrders.findOrderNumber(orderNumber);
            // let users = await rpoUsers.getByIdM(orders[0].userId);
    
            if (orders.length > 0) {
    
                // if ( !orders[0].user  ) {
                //     orders[0].user = users[0]
                // }
    
                let path = './public/pdf/'+orders[0].orderNumber.toLowerCase()+'.pdf'
    
                if (fs.existsSync(path)) {
    
                    // console.log('exec', orders[0]);
    
                    let now = Date.now();
                    let pdfName = orders[0].orderNumber.toLowerCase()+'.pdf';
    
    
                    const PDFDocument = require('pdfkit');
    
                    // Create a document
                    const doc = new PDFDocument;
                    var stream = doc.pipe(blobStream());
    
                    let leftSpace = 50;
                    let verticalSpace = 90;
    
                    // Pipe its output somewhere, like to a file or HTTP response
                    // See below for browser usage
                    doc.pipe(fs.createWriteStream('public/pdf/'+ pdfName));
    
                    doc.image ('public/images/pdf-icon.png', 400, -10, { "width": 180 });
    
    
                    doc.image ('public/images/trademarkers.png', leftSpace, verticalSpace, { "width": 180 });
    
                    verticalSpace += 50
    
                    doc.font('Helvetica-Bold')
                    .fontSize(13)
                    .text(`| Bill To. ${orders[0].charge.metadata.customerName}`, leftSpace, verticalSpace);
    
                    doc.fontSize (8.5);
    
    
                    let email=orders[0].charge.receipt_email, address=orders[0].charge.metadata.customerAddress
    
    
    
                    // if ( orders[0].charge.metadata ) {
                    //     email = orders[0].charge.receipt_email
                    //     address = orders[0].charge.metadata.customerAddress
                    // }
    
                    verticalSpace += 20
                    doc.text (`E, ${email}`, leftSpace + 50, verticalSpace );
                    
                    if (address) {
                        verticalSpace += 15
                        doc.text (`A, ${address}`, leftSpace + 50, verticalSpace );
    
                    }
                    
                    doc.fontSize (32);
                    doc.fillColor('#000').text ('INVOICE', leftSpace + 350, verticalSpace - 60 );
    
                    doc.fontSize (8.5);
                    verticalSpace += 30
                    doc.fillColor('#000')
                    doc.moveDown ();
    
    
                    // ITEM HEAD
    
                    verticalSpace += 20 
    
                    generateTableRowCustom(
                        doc,
                        verticalSpace,
                        "Description",
                        "Price",
                        "QTY",
                        "TOTAL"
                    );
    
                    // ITEM HEAD END
                    // let items 
    
                    // let totalAmount = 0;
                    // let totalDiscount = 0;
    
                    // if ( orders[0].cartItems ) {
                        
                        // for(let i = 0; i < orders[0].cartItems.length; i++) {
                        // ITEM BODY
                        verticalSpace += 20
                        generateHr(doc, verticalSpace);
                        doc.font("Helvetica");
    
                        verticalSpace += 10
                        // // add linebreak after 25 char on description TO DO
                        // let tmType = 'Design-Only or Stylized Word-Only (Figurative)'
    
                        // if (orders[0].cartItems[i].type == "Combined Word and Design") {
                        //     tmType = 'Combined Word and \nDesign - ' + orders[0].cartItems[i].name
                        // } else if ( orders[0].cartItems[i].type == "Word-Only" ) {
                        //     tmType = 'Word-Only - \n' + orders[0].cartItems[i].name
                        // } else {
                        //     tmType = 'Design-Only or Stylized \nWord-Only (Figurative) - ' + orders[0].cartItems[i].name
                        // }
    
                        // tmType = orders[0].cartItems[i].type + " - " + orders[0].cartItems[i].name
    
                        // totalAmount += orders[0].cartItems[i].price ? orders[0].cartItems[i].price : orders[0].cartItems[i].amount
                        // totalDiscount += orders[0].cartItems[i].discount ? orders[0].cartItems[i].discount : 0
                        generateTableRowCustom(
                            doc,
                            verticalSpace,
                            orders[0].charge.metadata.description,
                            "$"+orders[0].charge.amount / 100,
                            '1',
                            "$"+orders[0].charge.amount / 100
                        );
    
                        verticalSpace += 20
                        generateHr(doc, verticalSpace);
    
                        // ITEM BODY END
                        // }
    
                    // }
              
    
                    // ITEM BODY END
    
    
    
                    verticalSpace += 30
    
                    doc.font("Helvetica-Bold");
                    doc.fontSize(13).text ('PAYMENT METHOD', leftSpace , verticalSpace);
    
                    doc.fontSize(13).underline( leftSpace + 300, 15 ,200 , verticalSpace, { color: '#000' }).text ('SUBTOTAL:                $'+(orders[0].charge.amount / 100), leftSpace + 300, verticalSpace);
                    doc.fontSize(13).underline( leftSpace + 300, 35 ,200 , verticalSpace, { color: '#000' }).text ('DISCOUNT:                $0', leftSpace + 300, verticalSpace + 20);
                    doc.fontSize(13).underline( leftSpace + 300, 55 ,200 , verticalSpace, { color: '#000' }).text ('TOTAL:                       $'+(orders[0].charge.amount / 100), leftSpace + 300 , verticalSpace + 40);
    
    
                    doc.font("Helvetica");
                    doc.fillColor('#666').fontSize(8.5).text ('BANK: JP Morgan Chase', leftSpace , verticalSpace+=20);
                    doc.fillColor('#666').fontSize(8.5).text ('SWIFT: CHASUS33', leftSpace , verticalSpace+=15);
                    doc.fillColor('#666').fontSize(8.5).text ('Account No: 55964-0730', leftSpace , verticalSpace+=15);
                    doc.fillColor('#666').fontSize(8.5).text ('Routing No: 267084131', leftSpace , verticalSpace+=15);
    
    
                    if ( !orders[0].paid ) {
                    verticalSpace += 30
                    doc.fillColor('#000')
                    doc.font("Helvetica-Bold");
                    doc.fontSize(13).text ('NOTES', leftSpace , verticalSpace);
    
                    doc.fillColor('#666')
                    doc.font("Helvetica");
                    doc.fontSize(8.5)
                    doc.moveDown ();
                    
                    doc.text ('Please specify your invoice number in your payment and correspondence');
    
                    }
    
                    doc
                    .fontSize(10)
                    .text('Trademarkers LLC', 100, 710, {width:"33%",align: "center" })
                    .text('Bank Address', 250, 710, {width:"33%",align: "center" })
                    .text('JP Morgan Chase', 380, 710, {width:"33%",align: "center" })
    
                    doc
                    .fontSize(10)
                    .text('45 Essex Street, Suite 202', 100, 725, {width:"33%",align: "center" })
                    .text('401 Madison Ave.', 250, 725, {width:"33%",align: "center" })
                    .text('SWIFT CHASUS33', 380, 725, {width:"33%",align: "center" })
    
                    doc
                    .fontSize(10)
                    .text('Millburn NJ 07041', 100, 740, {width:"33%",align: "center" })
                    .text('New York, NY 10017', 250, 740, {width:"33%",align: "center" })
                    .text('ACCOUNT NO: 55964-0730', 380, 740, {width:"33%",align: "center" })
    
                    doc
                    .fontSize(10)
                    .text('', 100, 755, {width:"33%",align: "center" })
                    .text('', 250, 755, {width:"33%",align: "center" })
                    .text('ROUTING NO: 267084131', 380, 755, {width:"33%",align: "center" })
    
    
                    doc.end ();
    
                    
                    return true;
    
                    // STORE RECORD FOR FUTURE RETRIEVAL
                    // rpoGeneratedPdf.putGeneratedPdf({
                    //     office: 'EUIPO',
                    //     type: 'opposition',
                    //     url: pdfName,
                    //     created: now,
                    //     name: 'asdasd'
                    // });
        
                }
            }
    
            return false;
    
            
    
        } catch(err) {
    
            return false;
            console.error(err)
        }
    
        
    }

exports.createPng = async function(pdfName,pngName) {
    return new Promise(function(resolve, reject) {

        var path    = require('path');
        var pdf2img = require('pdf2img');

        var input   = __dirname + "/../public/pdf/" + pdfName;
 
        pdf2img.setOptions({
          type: 'png',                                // png or jpg, default jpg
          size: 1024,                                 // default 1024
          density: 600,                               // default 600
          outputdir: __dirname + path.sep + '../public/pdf/png', // output folder, default null (if null given, then it will create folder name same as file name)
          outputname: pngName,                         // output file name, dafault null (if null given, then it will create image name same as input name)
          page: null,                                 // convert selected page, default null (if null given, then it will convert all pages)
          quality: 100                                // jpg compression quality, default: 100
        });

        pdf2img.convert(input, function(err, info) {
            if (err) reject(err);
            else resolve(info);
          });

    });
}





function generateTableRow(
    doc,
    y,
    service,
    description,
    country,
    classes,
    price,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(service, 50, y)
      .text(description, 170, y)
      .text(country, 280, y)
      .text(classes, 360, y)
      .text(price, 380, y, { width: 90, align: "right" })
      .text(quantity, 410, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }

  function generateTableRowCustom(
    doc,
    y,
    description,
    price,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(description, 50, y)
      .text(price, 380, y, { width: 90, align: "right" })
      .text(quantity, 410, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }
  
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  function generateHrTotal(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(600, y)
      .lineTo(80, y)
      .stroke();
  }