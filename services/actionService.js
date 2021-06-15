let rpoAction = require('../repositories/actionCode');

exports.createActionCode = async function(related_data,url) {

  // let code = makeid(2) + '-' + makeid(4) + '-' + makeid(1);
  let code = '';
  // console.log(code);

  let flag = true;
  for(;flag;){

    code = makeid(2) + '-' + makeid(4) + '-' + makeid(1); 
    let action = await rpoAction.getAction(code);

    if (action.length <= 0) flag = false;

  }

  let data = null

  
  
  if ( related_data.event ) {
    data = {
      number: code,
      redirect_to: url,
      basis: related_data.event.case.basis,
      name:related_data.event.case.name,
      class_number:related_data.event.case.nice,
      tm_number:related_data.event.case.number,
      domain: related_data.event.domains[0].domain_name,
      email_prospects: related_data.event.emailProspects,
      case: related_data.event.case,
      classes:[
        {
          class: 3,
          description: 'Toiletries; Essential oils and aromatic extracts; Aromatics [essential oils]; Rose oil; Peppermint crude oil; Aromatic oils; Aromatic essential oils; Scented oils; Aromatherapy oil; Ethereal oils; Essential oils of lemon; Essential oils of citron; Essential oils of cedarwood; Emulsified essential oils; Natural essential oils; Essential oils for soothing the nerves; Essential oils for household use; Essential oils for aromatherapy use; Essential oils for personal use; Non-medicated oils; Aromatherapy preparations; Natural oils for cosmetic purposes; Skin care oils [non-medicated]; Scented oils used to produce aromas when heated; Food flavourings [essential oils]; Flavourings for beverages [essential oils]; Mint essence [essential oil]; Blended essential oils; Lavender oil; Almond oil; Coconut oil for cosmetic purposes; Jasmine oil; Gaultheria oil; Pine oil; Essential vegetable oils; Essential oils of sandalwood.'
        }
      ], 
      event: related_data.event
    }

    rpoAction.put(data);
  } else {
    // common action codes
    //  for now sou forms
    console.log(related_data);
    // data = related_data
    related_data.number = code;
    rpoAction.put(related_data);
    data = related_data;
  }
  

  let mysqlData = {
    case_number: code,
    action_code_type_id: 0,
    action_code_campaign_id: null
  }

  let action = await rpoAction.putMysql(mysqlData);

  // console.log(action.insertId, "action");
  let mysqlDataRoute = {
    action_code_id: action.insertId,
    url: url,
    related_action_id: null
  }

  
  
  let actionRoute = await rpoAction.putMysqlRoutes(mysqlDataRoute);

  return data;
  
}

exports.createActionCodeCampaign = async function(data,campaign) {

  // let code = makeid(2) + '-' + makeid(4) + '-' + makeid(1);
  let code = '';
  // console.log(code);

  let flag = true;
  for(;flag;){

    code = makeid(2) + '-' + makeid(4) + '-' + makeid(1); 
    let action = await rpoAction.getAction(code);

    if (action.length <= 0) flag = false;

  }

  let data = null

  // make logic for old action with campaign
  

  return data;
  
}


function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;

  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}




