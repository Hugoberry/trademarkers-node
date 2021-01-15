let rpoAction = require('../repositories/actionCode');

exports.getPrice = async function(code) {

  let action = await rpoAction.getAction(code)
  let price = 250;

//   SET SOU PRICE STATIC PRICE NO RECORD IN MONGO YET
  if ( action[0].actionType == 'sou notification' ) {
    if ( action[0].reponse == "Extension for trademark allowance") {
        price = 175;
    } else {
        price = 250;
    }
  }
// console.log(action[0]);
  let classArr = action[0].trademark.classes.split(',');

  let noClass = classArr.length;

  price = price * noClass;
  console.log(price);
  return price;
  
}






