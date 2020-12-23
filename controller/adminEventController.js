var rpoEvent = require('../repositories/events');
var rpoTask = require('../repositories/task');


exports.events = async function(req, res, next) {

  let events = await rpoEvent.getAll();

  res.render('admin/events/', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard', 
    events: events 
  });

}

// exports.add = function(req, res, next) {

//   res.render('admin/events', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
// }

// exports.addSubmit = function(req, res, next) {

//   res.render('admin/events', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
// }

exports.show = async function(req, res, next) {

  let event = await rpoEvent.getResearcherEventById(req.params['id']);

  res.render('admin/events/view', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', event: event[0] });
    
}

exports.edit = async function(req, res, next) {

  let event = await rpoEvent.getResearcherEventById(req.params['id']);
  let task = await rpoTask.getTaskById(req.params['id']);

  res.render('admin/events/edit', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', event: event[0] });
    
}

exports.editSubmit = function(req, res, next) {

  rpoEvent.updateDetails(req.params['id'],req.body);

  res.flash('success', 'Event updated successfully!');

  res.redirect('/njs-admin/manage/events');

  // res.render('admin/events', { layout: 'layouts/admin-layout', title: 'Admin Dashboard' });
    
}
