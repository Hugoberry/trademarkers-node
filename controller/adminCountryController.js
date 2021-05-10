var rpo = require('../repositories/countries');

const multer = require('multer');
const path = require('path');

let moment = require('moment');
const { toInteger } = require('lodash');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let countries = await rpo.getAll();
  
  res.render('admin/country/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    countries: countries
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];

  // fetch trademark added services
  // let otherServices = await rpoAddedServices.getByTrademarkId(id);

  // let otherServicesData = {
  //   otherServices : otherServices
  // }

  // await rpo.updateDetails(id, otherServicesData);

  let country = await rpo.getByIdM(id);


  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  // if ( trademarks[0].serialNumber ) {
  //   let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
  //   trademarks = await rpo.getById(id);
  // }
  
  res.render('admin/country/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    country: country[0]
  });
    
}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let country = await rpo.getByIdM(id);
  
  res.render('admin/country/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    country: country[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = req.body;


  await rpo.updateDetails(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/country/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


