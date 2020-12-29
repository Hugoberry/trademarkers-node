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

  let data = {
    number: code,
    redirect_to: url,
    related_data: related_data
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

  rpoAction.put(data);
  
  let actionRoute = await rpoAction.putMysqlRoutes(mysqlDataRoute);

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




