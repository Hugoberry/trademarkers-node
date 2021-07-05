var rpo = require('../repositories/orders');
var rpoUsers = require('../repositories/usersMongo');
var rpoAdminActivity = require('../repositories/adminActivityLog')
var activityLog = require('../services/adminActivityLogService');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let orders = await rpo.getAll();
  
  res.render('admin/order/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    orders: orders
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];

  let orders = await rpo.getById(id);

  if (orders[0] && !orders[0].user) {
    if (orders[0].userId) {
      let users = await rpoUsers.getByIdM(orders[0].userId)
      rpo.update(orders[0]._id, {user:users[0]})
      orders[0].user = users[0]
    }
  }

  let logs = await rpoAdminActivity.getLogs('orders',id)

  orders[0].logs = logs

  
  res.render('admin/order/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    order: orders[0]
  });
    
}



exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let order = await rpo.getById(id);
  
  res.render('admin/order/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    order: order[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  let order = await rpo.getById(id);

  let updateData = {
    paid : req.body.paid == "true" ? true : false,
    paymentMethod: req.body.paymentMethod
  }

  let messageLog = "Updated order record"
  let activityData = {
    message: messageLog,
    obj: order[0],
    objId: order[0]._id,
    objType: 'orders'
  }
  
  activityLog.logger(activityData, req);

  await rpo.update(id, updateData);

  

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/orders/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


