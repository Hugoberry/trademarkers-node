const jwt = require('jsonwebtoken');
var rpoTask = require('../repositories/task');
var rpoMongoTask = require('../repositories/taskMongo');

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};


exports.index = function(req, res, next) {

  // console.log(db.mongoConnection);
  
  res.render('researcher/', { layout: 'layouts/public-layout-researcher', title: 'Researcher' });
    
}

exports.tasks = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  // let task = await rpoTask.getUserTask(user.id);
  // task[0].details = await rpoTask.getUserTaskDetails(task[0].id);

  // let userExist = await rpoMongoTask.check(user);
  // let taskMongo = await rpoMongoTask.putTask(task[0]);

  res.render('researcher/tasks', { layout: 'layouts/public-layout-researcher', title: 'Researcher' });
    
}

exports.leads = function(req, res, next) {
  
  res.render('researcher/leads', { layout: 'layouts/public-layout-researcher', title: 'Researcher' });
    
}

exports.events = function(req, res, next) {
  
  res.render('researcher/events', { layout: 'layouts/public-layout-researcher', title: 'Researcher' });
    
}

exports.eventsAdd = async function(req, res, next) {

  let decode = jwt.decode(req.cookies.jwt, {complete: true});
  let user = JSON.parse(decode.payload.user);
  
  // let task = await rpoTask.getUserTask(user.id);
  // task[0].details = await rpoTask.getUserTaskDetails(task[0].id);
  
  res.render('researcher/events-add', { layout: 'layouts/public-layout-researcher', title: 'Researcher', task: null });
    
}

exports.eventsAddSubmit = function(req, res, next) {
  
  console.log('submit');

  next();
}

