const jwt = require('jsonwebtoken');
var rpoTask = require('../repositories/task');
var rpoMongoTask = require('../repositories/taskMongo');
var rpoUsers = require('../repositories/usersMongo');

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

exports.tasksAdd = async function(req, res, next) {

  let users = await rpoUsers.getResearchers();

  // console.log(users);

  res.render('admin/tasks/add', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', users: users });
    
}

exports.tasksAddSubmit = async function(req, res, next) {

  // console.log(req.body, 'asd');

  let userAssign = await rpoUsers.getResearchersById(req.body.task_id);

  req.body.researcher = userAssign;

  let task = await rpoTask.putTask(req.body);

  res.flash('success', 'Task Saved!');

  res.redirect("/njs-admin/manage/tasks");
    
}

exports.events = function(req, res, next) {

  // console.log(db.mongoConnection);
  
  res.render('admin/', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
}


