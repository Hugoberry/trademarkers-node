let rpoOrder = require('../repositories/orders');
let rpoUserMysql = require('../repositories/users');
let rpoTrademarksMysql = require('../repositories/trademarks');
const { getCountryPerContinentMysql } = require('../repositories/continents');

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

  let users = await rpoUserMysql.getUsers();
  

  for (var i = 0; i < users.length; i++) {

    // fetch orders from this user
    let orders = await rpoOrder.fetchOrderByUser(users[i].id);
    let userProfile = await rpoUserMysql.getUserProfile(users[i].id)

    if (orders.length > 0) {

      // insert user in collection if not exist
      rpoUserMysql.putUser(users[i]);

      // format address
      let address = userProfile[0].street + " " + userProfile[0].city +", "+ userProfile[0].state + " " + userProfile[0].country +" "+ userProfile[0].zip_code;

      // FORMAT DATA FOR STORING IN ORDER SUMMARY
      let summary = {
        customerId: users[i].id,
        name: users[i].name,
        email: users[i].email,
        address: address,
        city: userProfile[0].city,
        state: userProfile[0].state,
        street: userProfile[0].street,
        house: userProfile[0].house,
        zipCode: userProfile[0].zip_code,
        country: userProfile[0].country,
        phone: userProfile[0].phone_number,
        fax: userProfile[0].fax,
        entity: userProfile[0].company ? 'company' : 'individual',
        orders: [],
        contacts: {
          greet: 'Mr/Mrs',
          name: userProfile[0].first_name
        }

      };

      // fetch trademarks per order
      
      for (var o = 0; o < orders.length; o++) {

        let ordersData = {
          orderNo: orders[o].order_number,
          orderId: orders[o].id,
          items: []
        } 

        let trademarks = await rpoTrademarksMysql.fetchTmByOrder(orders[o].id);

        for (var t = 0; t < trademarks.length; t++) {

          

          let classArr = [];

          if (trademarks[t].classes) {
            let classNumber = trademarks[t].classes.split(",")
            let classDescription = trademarks[t].classes_description;
            for (let i = 0; i < classNumber.length; i++) {
                if(classNumber[i]) {
                    classArr.push({
                        classNo: classNumber[i],
                        goodsServices: classDescription
                    });
                }
            }
          }
          

          let item = {
            service: trademarks[t].service,
            type: trademarks[t].type,
            name: trademarks[t].name,
            class: classArr

          }
          ordersData.items.push(item)
          
        }

        summary.orders.push(ordersData)

      }
      rpoOrder.put(summary);
      // console.log('for save data', summary);
      
      // break;
    }

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




