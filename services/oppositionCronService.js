let  rpo = require('../repositories/oppositionLeads');

exports.generateAndSend = async function() {

  let fetch = await rpo.getlimitData(1);
  console.log(fetch);
}

