let rpoAction = require('../repositories/actionCode');

exports.getPrice = async function(code) {

  let action = await rpoAction.getAction(code)
  let price = 250;
  let noClass = 1;

//   SET SOU PRICE STATIC PRICE NO RECORD IN MONGO YET
  if ( action[0].actionType == 'sou notification' ) {
    if ( action[0].response == "Extension for trademark allowance") {
        price = 175;
    } else {
        price = 250;
    }
  }
  // console.log(action[0]);
  if (action[0] && action[0].trademark ) {
    let classArr = action[0].trademark.classes.split(',');
    noClass = classArr.length;
  }
  
  price = price * noClass;
  // console.log(price);
  return price;
  
}






