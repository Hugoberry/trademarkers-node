let rpoOrder = require('../repositories/orders');
let rpoUserMysql = require('../repositories/users');
let rpoTrademarksMysql = require('../repositories/trademarks');

exports.createOrderCode = async function() {

  // let code = makeid(2) + '-' + makeid(4) + '-' + makeid(1);
  let code = '';
  // console.log(code);

  let flag = true;
  for(;flag;){

    code = makeid(4) + '-' + makeid(2); 
    let order = await rpoOrder.findOrderNumber(code);

    if (order.length <= 0) flag = false;

  }

  return code;
  
}

exports.syncOrders = async function() {

  // FETCH ALL ORDERS AND FORMAT FOR STORING IN MONGO
  // MAYBE FETCH ALL USERS 1ST AND FETCH ORDERS FOR THAT USER AND FETCH TRADEMARKS PER ORDER

  
  // let orders = await rpoOrder.fetchOrderByUser();
  // let user_id = 0;
  // let user_data = null;

  // for (var i = 0; i < orders.length; i++) {
  //   console.log(orders[i]);
  //   if ( user_id != orders[i].user_id ) {
  //     // new user
  //     user_data = {
  //       user_id: orders[i].user_id,
  //       user_name: orders[i].user_name,
  //       user_email: orders[i].user_email,
  //       user_password: orders[i].user_password,
  //       user_role: orders[i].user_role,
  //       user_created_date: orders[i].user_created_date,
  //     }
  //   } else {
  //     // store records in orders and fetch 
  //   }


  //   let trademarks = await rpoTrademarksMysql.fetchTmByOrder(orders[i].order_id)
  //   console.log(trademarks.length);
  //   break;
  // }

  let users = await rpoUserMysql.getUsers()

  for (var i = 0; i < users.length; i++) {
    // insert user in collection if not exist
    rpoUserMysql.putUser(users[i]);
    console.log(users[i].id);
    // fetch orders from this user
    // let orders = await rpoOrder.fetchOrderByUser(users[i].id);
break;
  }
  
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




