var rpo = require('../repositories/promoCode');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  let users = await rpo.getAll();
  
  res.render('admin/promo/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    users: users
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];


  let code = await rpo.getById(id);

  res.render('admin/promo/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    code: code[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  // let user = await rpo.getByIdM(id);
  
  res.render('admin/promo/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard'
  });
    
}

exports.addSubmit = async function(req, res, next) {

  let flag = true
  let code;

  for ( ; flag; ) {
      code = helpers.makeid(7)

      let codes = await rpo.getByCode(code)

      if ( codes.length <= 0 ) {
          flag = false
      }
  }

  let codeData = req.body;
  codeData.code = code;
  codeData.created_at = toInteger(moment().format('YYMMDD'));
  codeData.created_at_formatted = moment().format();


  await rpo.put(codeData);

  res.flash('success', 'Added successfully!');
  res.redirect('/njs-admin/manage/promo/');


  
  next()
  

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let code = await rpo.getById(id);
  
  res.render('admin/promo/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    code: code[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = req.body;


  await rpo.updateDetails(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/promo/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


