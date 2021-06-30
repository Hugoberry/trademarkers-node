var rpo = require('../repositories/mongoTrademarks');
var rpoAddedServices = require('../repositories/trademarkAddedServices');
var rpoUser = require('../repositories/users');
var rpoUserMongo = require('../repositories/usersMongo');
var rpoAtty = require('../repositories/attorneys');
var rpoComments = require('../repositories/comments');

var mailService = require('../services/mailerService');
var crawlerService = require('../services/crawlerService');

const multer = require('multer');
const path = require('path');

var helpers = require('../helpers');
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

exports.show = async function(req, res, next) {

  let id = req.params['id'];

  // fetch trademark added services
  let otherServices = await rpoAddedServices.getByTrademarkId(id);

  let otherServicesData = {
    otherServices : otherServices
  }

  await rpo.updateDetails(id, otherServicesData);

  let trademarks = await rpo.getById(id);


  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  if ( trademarks[0].serialNumber ) {
 
    if (trademarks[0].lastCrawled && moment(moment()).diff(trademarks[0].lastCrawled, "day") > 0  ) {
      console.log('yes');
      let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
      trademarks = await rpo.getById(id);
    } else {
      console.log('no');
    }
  }
  
  res.render('admin/trademark/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    trademark: trademarks[0]
  });
    
}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  // fetch trademark added services
  let otherServices = await rpoAddedServices.getByTrademarkId(id);

  let udpateData = {
    otherServices : otherServices
  }

  let trademark = await rpo.getById(id);

  if (!trademark[0].user) { 
    let currUser = await rpoUserMongo.getByIdM(trademark[0].userId);
    udpateData.user = currUser[0]
  }

  // await rpo.updateDetails(id, data)

  await rpo.updateDetails(id, udpateData);
  

  let trademarks = await rpo.getById(id);

  let atty = await rpoAtty.getAll()




  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  if ( trademarks[0].serialNumber ) {
 
    if (trademarks[0].lastCrawled && moment(moment()).diff(trademarks[0].lastCrawled, "day") > 0  ) {
      console.log('yes');
      let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
      trademarks = await rpo.getById(id);
    } else {
      console.log('no');
    }
  }
  
  res.render('admin/trademark/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    trademark: trademarks[0],
    atty: atty
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  let trademark = await rpo.getById(id);

  let certificate = req.files ? req.files.certificate : null;

  let serviceLength = req.body.addAmount ? req.body.addAmount.length : 0;

  // UPDATE IF NO USER BUT HAS MYSQLID
  if (trademark[0].mysqlRecord && !trademark[0].user) {
    console.log('no user found!');
    let user = await rpoUserMongo.getById(trademark[0].mysqlRecord.user_id)
    user = user[0]
    if ( !user ) {
      user = await rpoUser.getUserByID(trademark[0].mysqlRecord.user_id)
      user = user[0]
    }
    console.log("fetched user", user);
    trademark[0].user = user

    let userData = {
      user : user
    }

    rpo.updateDetails(trademark[0]._id, userData)
  }

  if (Array.isArray(req.body.addAmount)) {

    for (let key=0; key < serviceLength; key++ ) {

      // check service if paid or emailed to customer
      if ( req.body.serviceId[key] ) {
  
        if ( serviceLength == 1 ) {
          let serviceData = {
            addAmount: req.body.addAmount,
            addAmountDescription: req.body.addAmountDescription,
            status: req.body.status
          }
  
          await rpoAddedServices.updateDetails(req.body.serviceId,serviceData);
        } else {
          let serviceData = {
            addAmount: req.body.addAmount[key],
            addAmountDescription: req.body.addAmountDescription[key],
            status: req.body.status[key],
          }
  
          await rpoAddedServices.updateDetails(req.body.serviceId[key],serviceData);
        }
  
        
      } else {
        // add record
        if ( req.body.addAmount && req.body.addAmountDescription) {
          let serviceData = {
            trademarkId: id,
            addAmount: req.body.addAmount[key],
            addAmountDescription: req.body.addAmountDescription[key],
            status: 'unPaid',
            isMailed: 'no',
            created_at: toInteger(moment().format('YYMMDD')),
            created_at_formatted: moment().format()
          }
          console.log('add service', key);
          await rpoAddedServices.put(serviceData);
        }
      }
  
      
    }

  } else {

    if ( req.body.serviceId ) {

      let serviceData = {
        addAmount: req.body.addAmount,
        addAmountDescription: req.body.addAmountDescription,
        status: req.body.status
      }
  
      await rpoAddedServices.updateDetails(req.body.serviceId,serviceData);

    } else {
      if ( req.body.addAmount && req.body.addAmountDescription) {
        let serviceData = {
          trademarkId: id,
          addAmount: req.body.addAmount,
          addAmountDescription: req.body.addAmountDescription,
          status: 'unPaid',
          isMailed: 'no',
          created_at: toInteger(moment().format('YYMMDD')),
          created_at_formatted: moment().format()
        }
        // console.log('add service', key);
        await rpoAddedServices.put(serviceData);
      }
      
    }

    

  }
  
  res.flash('success', 'Updated successfully!');



  if ( certificate ) {

    let ext = certificate.name.match(/\.[0-9a-z]+$/i)[0]

    uploadPath = __dirname + '/../public/uploads/certificate/' + certificate.md5 + ext.toLowerCase();
    console.log(uploadPath);
    await certificate.mv(uploadPath, async function(err) {
      if (err) {
        console.log("error", err);
        res.flash('error', 'Something went wrong, failed to upload!');
      } else {
        console.log("uploaded pdf");
        res.flash('success', 'File uploaded!');

        // UPDATE COLLECTION
        certificate.addedDate = toInteger(moment().format('YYMMDD'))
        certificate.ext = ext
        certificate.customName = certificate.md5 + ext.toLowerCase()

        // check if user
        

        let data = {
          certificate: certificate,
          certificatePath: uploadPath
        }

        await rpo.updateDetails(id, data);

        // wait for the updates
        await new Promise(resolve => setTimeout(resolve, 5000));

        mailService.sendCertificateNotification(trademark[0])
      }
        
    });

    

  }

  // check delivery updates
 


  let otherServices = await rpoAddedServices.getByTrademarkId(id);

  let delivery = trademark[0].delivery;

  if (delivery) {
    delivery.status = req.body.delivery_status
    delivery.trackingNumber = req.body.delivery_tracking
  }

  let comments= trademark[0].comments ? trademark[0].comments : []
  if (req.body.comments) {
    let authUser = await helpers.getLoginUser(req)
    let commentData = {
      trademarkId: trademark[0]._id,
      userId: authUser._id,
      authUser: authUser,
      alias: "Trademarkers LLC",
      message: req.body.comments,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    await rpoComments.put(commentData)
    comments.push(commentData)
  }

  
  
  

  let otherServicesData = {
    otherServices : otherServices,
    serialNumber: req.body.serialNumber,
    registrationNumber: req.body.registrationNumber,
    registrationDate: req.body.registrationDate,
    filingDate: req.body.filingDate,
    delivery: delivery,
    dueDate: req.body.dueDate,
    status: req.body.statusUpdate,
    notes: req.body.notes,
    comments: comments
  }

  if (req.body.attorneyId) {
    
    

    let attorney = await rpoAtty.getById(req.body.attorneyId);

    if ( !trademark[0].attorney ) {
      // SEND EMAIL NOTIFICATION HERE
    }

    if (attorney[0]) {
      otherServicesData.attyId = attorney[0]._id
      otherServicesData.attorney = attorney[0]
    }
  }

  await rpo.updateDetails(id, otherServicesData);

  
  res.redirect('/njs-admin/manage/trademark/');
  // let event = await rpoEvent.getResearcherEventById(req.params['id']);
  
  // res.render('researcher/events-view', { layout: 'layouts/public-layout-researcher', title: 'Researcher', event: event[0] });
    
}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


