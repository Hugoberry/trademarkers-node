var rpo = require('../repositories/activityLog');


var actionService = require('../services/actionService');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let activities = await rpo.getAll();

  
  res.render('admin/activities/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    activities: activities
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];
  let activity = await rpo.getById(id);

  res.render('admin/activities/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    activity: activity[0]
  });
    
}


exports.deleteRecord = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpo.remove(req.params.id)

  console.log("res", result);
  res.flash('success', 'Deleted successfully!');
  res.redirect('/njs-admin/manage/activities/');

}


