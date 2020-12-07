const jwt = require('jsonwebtoken');
var rpoTask = require('../repositories/task');
var rpoMongoTask = require('../repositories/taskMongo');

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// var rpoUsersMongo = require('../repositories/usersMongo');


exports.index = function(req, res, next) {

  // console.log(db.mongoConnection);
  
  res.render('admin/', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
}

exports.tasks = async function(req, res, next) {

  let tasks = await rpoTask.getAllTask();

  console.log(tasks);
  
  res.render('admin/tasks/', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', tasks: tasks });
    
}

exports.tasksAdd = function(req, res, next) {

  res.render('admin/tasks/add', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
}

exports.tasksAddSubmit = function(req, res, next) {

  // console.log(req.body, 'asd');

  rpoTask.putTask(req.body);

  res.flash('success', 'Task Saved!');

  res.redirect("/njs-admin/manage/tasks");
    
}

exports.events = function(req, res, next) {

  // console.log(db.mongoConnection);
  
  res.render('admin/', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
}


