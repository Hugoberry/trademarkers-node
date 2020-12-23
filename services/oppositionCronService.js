let rpo = require('../repositories/oppositionLeads');
let rpoDomains = require('../repositories/domains');
let rpoEmails = require('../repositories/eventEmails');
let rpoEvents = require('../repositories/events');
let rpoOutbox = require('../repositories/outbox');
var actionService = require('../services/actionService')

let mailService = require('../services/mailerService')

const _variables = require( '../config/variables' );

let moment = require('moment');

exports.generateDomainEmail = async function() {

  let leads = await rpo.getlimitData(1);

  leads.forEach(function(lead,key) {
    let str = cleanString(lead.name);

    // create domains and email address
    generateDomains(lead);

    let data = {
      domain_generated : true,
      email_generated  : true
    }

    rpo.updateDetails(lead._id,data)

  })

}

exports.sendEvent = async function() {

  let events = await rpoEvents.getlimitData(1);

  // fetch events 
  // get lead / domain / email
  // if all exist send email 

  if ( events.length > 0 ) {
    let event = events[0];
    let lead = await rpo.getById(event.opposition_id)
    let domain = await rpoDomains.getByOppositionId(event.opposition_id)
    let email = await rpoEmails.getByOppositionId(event.opposition_id)

    if ( email.length > 0 ) {
    
      // send event email
      let emailDataSet = {
        lead  : lead[0],
        domain: domain[0],
        email : email[0],
        event : event
      }

      let actions = [];
      actions.udpr        = await actionService.createActionCode(emailDataSet,'/what-is-the-uniform-domain-name-dispute-resolution-policy');
      actions.services    = await actionService.createActionCode(emailDataSet,'/services');
      actions.register    = await actionService.createActionCode(emailDataSet,'/countries');
      actions.about       = await actionService.createActionCode(emailDataSet,'/about');
      actions.video       = await actionService.createActionCode(emailDataSet,'/video/PexvELzGraA');
      actions.prices      = await actionService.createActionCode(emailDataSet,'/prices');
      actions.resources   = await actionService.createActionCode(emailDataSet,'/resources');
      actions.blog        = await actionService.createActionCode(emailDataSet,'/blog');
      actions.contact     = await actionService.createActionCode(emailDataSet,'/contact');

      emailDataSet.actions = actions;
      let emailRes = mailService.eventEmail(emailDataSet);
      let emailUpdateData = {
        status: 'sent'
      }

      // rpoOutbox.put(emailRes)
      rpoEmails.updateDetails(email[0]._id, emailUpdateData)
    }

    // update event last crawl
    let eventUpdateData = {
      last_crawl: moment().toDate()
    }
    rpoEvents.updateDetails(event._id, eventUpdateData)

  }

}


 function generateDomains(data) {
  let str = cleanString(data.name);

  console.log('generating domains and emails to use in event');
  
  // create domain and emails
  _variables.domainTLD.forEach(function(name,key){

    let domainData = {
      domain_name   : str + "." + name.name,
      opposition_id : data._id,
      created_at    : moment().toDate()
    }
    // console.log(domainData);
    rpoDomains.put(domainData)
    console.log("generated domain ++ " + domainData.domain_name + " ++");
    _variables.emailGen.forEach(function(email,key){
      
      let emailData = {
        email         : email.name + "@" + domainData.domain_name,
        domain        : domainData.domain_name,
        opposition_id : data._id,
        status        : 'pending',
        created_at    : moment().toDate()
      }

      rpoEmails.put(emailData)
      console.log("generated email ++ "+ emailData.email +" ++");

    })

    // create event
    let yesterday = moment().subtract(1, "days").toDate();

    let eventData = {
      opposition_id : data._id,
      event_type    : 'opposition-for-domain-owners-euipo',
      last_crawl    : yesterday,
      created_at    : moment().toDate(),
      opposition    : data,
      domain        : domainData
    }

    rpoEvents.put(eventData);

    console.log("generated event ++ "+ eventData.event_type +" ++");

  })
  
  
  

}

function cleanString(str) {
  str = str.replace(/\s/g, '');
  str = str.replace(/[^a-zA-Z0-9]/g, '');

  return str.toLowerCase()
}
