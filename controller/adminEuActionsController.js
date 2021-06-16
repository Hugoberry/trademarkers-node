var rpo = require('../repositories/actionCodes');
var rpoCountries = require('../repositories/countries');

var actionService = require('../services/actionService');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let actionCodes = await rpo.getAll();
  
  res.render('admin/euActions/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    actionCodes: actionCodes
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];
  let actionCodes = await rpo.getById(id);

  res.render('admin/euActions/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    actionCode: actionCodes[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  let countries = await rpoCountries.getAll();
  
  res.render('admin/euActions/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    countries: countries
  });
    
}

exports.addSubmit = async function(req, res, next) {

  let code = await actionService.createActionCodeEU()

  console.log(req.body, code);

  let data = {
    code : code,
    res : req.body, 
    created_at : toInteger(moment().format('YYMMDD')),
    created_at_formatted : moment().format()
  }

  data.res.discountExp = toInteger(moment(data.res.discountExp).format('YYMMDD'))

  await rpo.put(data)

  res.flash('success', 'Added successfully!');
  res.redirect('/njs-admin/manage/euactions/');

  
  next()
  

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let actionCodes = await rpo.getById(id);
  let countries = await rpoCountries.getAll();
  
  res.render('admin/euActions/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    actionCode: actionCodes[0],
    countries: countries
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = {
    res: req.body
  }

  updateData.res.discountExp = toInteger(moment(updateData.res.discountExp).format('YYMMDD'))

  await rpo.update(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/euactions/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


