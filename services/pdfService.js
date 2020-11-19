const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const fs  = require('fs');

const rpoGeneratedPdf = require('../repositories/generatedPdf');

exports.generate = function(data) {


    let now = Date.now();
    let pdfName = now +'-'+ data.trademark_number + '.pdf';

    const PDFDocument = require('pdfkit');

    // Create a document
    const doc = new PDFDocument;
    var stream = doc.pipe(blobStream());

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream('public/pdf/'+ pdfName));

    doc.image ('public/images/ncubator.logo.png', 330, 20, { "width": 250 });

    doc.moveTo (30, 68);
    doc.lineTo (500,68);
    doc.stroke ();

    doc.font('public/fonts/Franklin Gothic Medium Regular.ttf')
    .fontSize(14)
    .text('N-Cubator B.V. | Markt 19 | NL-6071 Swalmen', 31, 48);

    doc.fontSize (8.5);
    doc.text ('N-Cubator B.V. | Markt 19 | NL-6071 Swalmen | The Netherlands', 69, 146);
    doc.moveTo (64, 156);
    doc.lineTo (330, 156);
    doc.stroke ();
    doc.moveTo (30,155);
    doc.moveTo (55,155);
    doc.fontSize (13.5);
    doc.text ('European Union Intellectual Property Office', 75, 175);
    doc.text ('Av. de Europa, 4');
    doc.text ('E-03008 Alicante');
    doc.text ('Espana');
    doc.text ('Swalmen, Nov. 17, 2020', 375, 275);
    doc.text ('European Union Trademark Application No. '+data.trademark_number+' "'+data.trademark_name+'"', 78, 335);
    doc.text ('Opposition '+data.opposition_number+' by BAUDI Europe B.V."');
    doc.moveDown ();
    doc.moveDown ();
    doc.text ('Dear Sirs, ');
    doc.moveDown ();
    doc.text ('In the proceedings referenced above we respectfully request an extension of present deadlines by at least an additional 2 months. ');
    doc.moveDown ();
    doc.text ('Due to the present public health crisis known as the “Covid Pandemic”, our operations are currently forced to work with skeleton staff, and we will require additional time to coordinate the necessary research to evaluate, and respond to, the subject opposition. ');
    doc.moveDown ();
    doc.moveDown ();
    doc.text ('Respectfully, ');
    doc.moveDown ();
    // doc.image ('mg-signature.png', { "fit": [160, 999], "align": "left" });

    doc.end ();

    // STORE RECORD FOR FUTURE RETRIEVAL
    rpoGeneratedPdf.putGeneratedPdf({
        office: 'EUIPO',
        type: 'opposition',
        url: pdfName,
        created: now,
        name: data.trademark_name
    });
}