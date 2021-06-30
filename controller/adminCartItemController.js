var rpo = require('../repositories/cartItems');
var rpoUsers = require('../repositories/usersMongo')
var rpoCountries = require('../repositories/countries')

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  let items = await rpo.getAll();
  
  res.render('admin/cartItems/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    items: items
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];


  let cartItem = await rpo.getById(id);

  res.render('admin/cartItems/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    cartItem: cartItem[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  let users = await rpoUsers.getAll();
  let countries = await rpoCountries.getAll();
  
  res.render('admin/cartItems/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    users: users,
    countries: countries
  });
    
}

exports.addSubmit = async function(req, res, next) {


  let cartItemData = req.body;

  

  let user = await rpoUsers.getByIdM(cartItemData.userId)
  cartItemData.user = user[0]
  cartItemData.userId = user[0]._id

  let country = await rpoCountries.getByIdM(cartItemData.country)
  cartItemData.country = country[0]

  

  if (cartItemData.class) {
    let classes=[];
    let description=[];
    var classDescription = cartItemData.class.split(";");

    for(let c=0; c < classDescription.length; c++ ){
      console.log(classDescription[c]);
      let classArr = classDescription[c].trim().split("|");
      classes.push(classArr[0].trim());
      description.push(classArr[1].trim());
    }

    cartItemData.class = classes
    cartItemData.description = description

  }

  if ( req.files && req.files.logo_pic ) {  

    let uploadPath;
    let logo_pic;
    let logoName;

    // updload file
    logoName = toInteger(moment().format('YYMMDDHHMMSS')) + '-' + req.files.logo_pic.name;
    req.body.logoName = logoName;
    logo_pic = req.files.logo_pic;
    uploadPath = __dirname + '/../public/uploads/' + logoName;
    // console.log(logo_pic);
    cartItemData.logoName = logoName;
    // Use the mv() method to place the file somewhere on your server
    logo_pic.mv(uploadPath, function(err) {
     
        
    });

  }

  cartItemData.status = "active"

  cartItemData.created_at = toInteger(moment().format('YYMMDD'))
  cartItemData.created_at_formatted = moment().format()

  await rpo.put(cartItemData);

  console.log(cartItemData);

  res.flash('success', 'Added successfully!');
  res.redirect('/njs-admin/manage/cart-items/');


  
  // next()
  

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let item = await rpo.getById(id);

  let users = await rpoUsers.getAll();
  let countries = await rpoCountries.getAll();
  
  console.log();

  res.render('admin/cartItems/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    item: item[0],
    users: users,
    countries: countries
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let cartItemData = req.body;

  let user = await rpoUsers.getByIdM(cartItemData.userId)
  cartItemData.user = user[0]
  cartItemData.userId = user[0]._id

  let country = await rpoCountries.getByIdM(cartItemData.country)
  cartItemData.country = country[0]

  // cartItemData.created_at = toInteger(moment().format('YYMMDD'))
  // cartItemData.created_at_formatted = moment().format()

  if (cartItemData.class) {
    let classes=[];
    let description=[];
    var classDescription = cartItemData.class.split(";");

    for(let c=0; c < classDescription.length; c++ ){
      console.log(classDescription[c]);
      let classArr = classDescription[c].trim().split("|");
      classes.push(classArr[0].trim());
      description.push(classArr[1].trim());
    }

    cartItemData.class = classes
    cartItemData.description = description

  }

  if ( req.files && req.files.logo_pic ) {  

    let uploadPath;
    let logo_pic;
    let logoName;

    // updload file
    logoName = toInteger(moment().format('YYMMDDHHMMSS')) + '-' + req.files.logo_pic.name;
    req.body.logoName = logoName;
    logo_pic = req.files.logo_pic;
    uploadPath = __dirname + '/../public/uploads/' + logoName;
    // console.log(logo_pic);
    cartItemData.logoName = logoName;
    // Use the mv() method to place the file somewhere on your server
    logo_pic.mv(uploadPath, function(err) {
     
        
    });

  }

  // if ( !cartItemData.logo_pic ) {
  //   delete cartItemData.logo_pic
  // }


  await rpo.update(id, cartItemData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/cart-items/');

}

exports.deleteRecord = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpo.remove(req.params.id)

  console.log("res", result);
  res.flash('success', 'Deleted successfully!');
  res.redirect('/njs-admin/manage/cart-items/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpo.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


