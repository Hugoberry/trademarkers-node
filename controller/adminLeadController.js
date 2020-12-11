var rpoLead = require('../repositories/lead');
var rpoTask = require('../repositories/task');


exports.leads = async function(req, res, next) {

  let leads = await rpoLead.getAllLeads();

  res.render('admin/leads/', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard', 
    leads: leads 
  });

}

exports.show = async function(req, res, next) {

  let lead = await rpoLead.getResearcherLeadById(req.params['id']);

  res.render('admin/leads/view', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', lead: lead[0] });
    
}

exports.edit = async function(req, res, next) {

  let lead = await rpoLead.getResearcherLeadById(req.params['id']);
  let task = await rpoTask.getTaskById(req.params['id']);

  res.render('admin/leads/edit', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', lead: lead[0] });
    
}

exports.editSubmit = function(req, res, next) {

  rpoLead.updateDetails(req.params['id'],req.body);

  res.flash('success', 'Lead updated successfully!');

  res.redirect('/njs-admin/manage/leads');

}
