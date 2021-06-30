var rpo = require('../repositories/attorneys');
var rpoCountries = require('../repositories/countries')

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let lists = await rpo.getAll();
  
  res.render('admin/attorneys/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    lists: lists
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

  let articles = await rpo.getById(id);


  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  // if ( trademarks[0].serialNumber ) {
  //   let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
  //   trademarks = await rpo.getById(id);
  // }
  
  res.render('admin/attorneys/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    article: articles[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  let countries = await rpoCountries.getAll();
  
  res.render('admin/attorneys/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    countries: countries
  });
    
}

exports.addSubmit = async function(req, res, next) {

  let attyData = req.body

  attyData.name = attyData.fname + " " + attyData.lname

  attyData.create_at = toInteger(moment().format('YYMMDD'))
  attyData.created_at_formatted = moment().format()

  await rpo.put(req.body);
  
  res.flash('success', 'Added successfully!');

  res.redirect('/njs-admin/manage/attorneys/');

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let list = await rpo.getById(id);
  let countries = await rpoCountries.getAll();
  
  res.render('admin/attorneys/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    list: list[0],
    countries: countries
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  let updateData = req.body;

  updateData.name = updateData.fname + " " + updateData.lname


  await rpo.update(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/attorneys/');

}

exports.deleteRecord = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpo.remove(req.params.id)

  console.log("res", result);
  res.flash('success', 'Deleted successfully!');
  res.redirect('/njs-admin/manage/attorneys/');

}


