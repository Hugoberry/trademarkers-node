var rpoLead = require('../repositories/oppositionLeads');
var rpoTask = require('../repositories/task');


exports.leads = async function(req, res, next) {

  let leads = await rpoLead.getAll1word();

  res.render('admin/oppositionLeads/', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard', 
    leads: leads 
  });

}

exports.show = async function(req, res, next) {

  let lead = await rpoLead.getById(req.params['id']);

  res.render('admin/oppositionLeads/view', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', lead: lead[0] });
    
}

exports.edit = async function(req, res, next) {

  let lead = await rpoLead.getById(req.params['id']);
  // let status = false;
// console.log(lead[0]);
  // if ( lead.lead_status && lead.lead_status == true ) {
  //   status = false;
  // } else {
  //   status = true;
  // }

  let data = {
    lead_status : lead[0].lead_status ? !lead[0].lead_status : true
  }
  // console.log(lead.lead_status);

  await rpoLead.updateDetails(req.params['id'],data);

  res.redirect('/njs-admin/manage/opposition-leads');
  // let task = await rpoTask.getTaskById(req.params['id']);

  // res.render('admin/oppositionLeads/edit', { layout: 'layouts/admin-layout', title: 'Admin Dashboard', lead: lead[0] });
    
}

exports.editSubmit = function(req, res, next) {

  rpoLead.updateDetails(req.params['id'],req.body);

  res.flash('success', 'Lead updated successfully!');

  res.redirect('/njs-admin/manage/leads');

}

exports.apiUpdate = function(req, res, next) {

  // rpoLead.updateDetails(req.params['id'],req.body);

  // res.flash('success', 'Lead updated successfully!');

  // res.redirect('/njs-admin/manage/leads');
  // console.log(res.body, res.params);
  // console.log(req.body);

  let dataUpdate = {
    lead_status: req.body.status
  }

  rpoLead.updateDetails(req.body.id,dataUpdate);

  res.json({
    status:true,
    message:"Record Updated"
  });

}

exports.getRecords = function(req, res, next) {

  // rpoLead.updateDetails(req.params['id'],req.body);

  // res.flash('success', 'Lead updated successfully!');

  // res.redirect('/njs-admin/manage/leads');
  // console.log(res.body, res.params);
  // console.log(req.body);

  let leads = rpoLead.getAll();

  res.json(leads);

}
