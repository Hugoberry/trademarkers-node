var rpo = require('../repositories/mongoTrademarks');
var rpoUser = require('../repositories/users');

var mailService = require('../services/mailerService');
var crawlerService = require('../services/crawlerService');

const multer = require('multer');
const path = require('path');

let moment = require('moment');
const { toInteger } = require('lodash');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let trademarks = await rpo.getAll();
  
  res.render('admin/trademark/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    trademarks: trademarks
  });
    
}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  // call crawl service to update record
  

  let trademarks = await rpo.getById(id);




  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  if ( trademarks[0].serialNumber ) {
    let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
    trademarks = await rpo.getById(id);
  }
  
  res.render('admin/trademark/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    trademark: trademarks[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];

  let certificate = req.files.certificate;
  // console.log(certificate);

  if ( certificate ) {

    let ext = certificate.name.match(/\.[0-9a-z]+$/i)[0]

    uploadPath = __dirname + '/../public/uploads/certificate/' + certificate.md5 + ext;

    await certificate.mv(uploadPath, function(err) {
      if (err) {
        console.log("error", err);
        res.flash('error', 'Something went wrong!');
      } else {
        res.flash('success', 'File uploaded!');
      }
        
    });

    // UPDATE COLLECTION
    certificate.addedDate = toInteger(moment().format('YYMMDD'))
    certificate.ext = ext
    certificate.customName = certificate.md5 + ext

    // check if user


    let data = {
      certificate: certificate,
      certificatePath: uploadPath
    }

    await rpo.updateDetails(id, data)

    let trademark = await rpo.getById(id);
    let user

    if (trademark && !trademark[0].mysqlRecord) {
      user = await rpoUser.getUserByIdMysql(trademark[0].mysqlRecord.user_id)

      await rpoUser.putUser(user[0])
      trademark[0].user = user[0]
    }

    
    mailService.sendCertificateNotification(trademark[0])

    res.flash('success', 'Updated successfully!');
  }


  
  res.redirect('/njs-admin/manage/trademark/');
  // let event = await rpoEvent.getResearcherEventById(req.params['id']);
  
  // res.render('researcher/events-view', { layout: 'layouts/public-layout-researcher', title: 'Researcher', event: event[0] });
    
}


