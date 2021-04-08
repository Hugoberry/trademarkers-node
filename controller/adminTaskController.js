const jwt = require('jsonwebtoken');
var rpoTask = require('../repositories/task');
// var rpoMongoTask = require('../repositories/taskMongo');
var rpoUsers = require('../repositories/usersMongo');

var mailService = require('../services/mailerService');

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

  let userAssign = await rpoUsers.getResearchersById(req.body.user_id);

  req.body.researcher = userAssign;

  let task = await rpoTask.putTask(req.body);
  let notif = await mailService.researcherNotify(
    `<p>Hi ${userAssign[0].name}</p>
    <p>You are currently assigned to a new task.</p>
    `,
    userAssign[0].email,
    'New Task Assigned'
    )

  res.flash('success', 'Task Saved!');

  res.redirect("/njs-admin/manage/tasks");
    
}

exports.taskShow = async function(req, res, next) {

  let users = await rpoUsers.getResearchers();
  let id = req.params['id'];
  let selectedTask = await rpoTask.getTaskById(id);

  res.render('admin/tasks/view', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    task: selectedTask[0],
    users: users
  });
    
}

exports.taskEdit = async function(req, res, next) {

  let users = await rpoUsers.getResearchers();
  let id = req.params['id'];
  let selectedTask = await rpoTask.getTaskById(id);



  res.render('admin/tasks/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    task: selectedTask[0],
    users: users
  });
    
}

exports.taskEditSubmit = async function(req, res, next) {


  rpoTask.updateTask(req.params['id'],req.body);

  res.flash('success', 'Task updated successfully!');
  res.redirect('/njs-admin/manage/tasks/');
  // let event = await rpoEvent.getResearcherEventById(req.params['id']);
  
  // res.render('researcher/events-view', { layout: 'layouts/public-layout-researcher', title: 'Researcher', event: event[0] });
    
}

// ====================== EVENT FUNCTIONS ======================
// =============================================================

exports.events = function(req, res, next) {

  // console.log(db.mongoConnection);
  
  res.render('admin/', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
}


