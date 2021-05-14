var rpo = require('../repositories/countries');
var rpoContinents = require('../repositories/continents');

const multer = require('multer');
const path = require('path');

let moment = require('moment');
const { toInteger } = require('lodash');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let countries = await rpo.getAll();
  
  res.render('admin/country/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    countries: countries
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];

  // fetch trademark added services
  // let otherServices = await rpoAddedServices.getByTrademarkId(id);

  // let otherServicesData = {
  //   otherServices : otherServices
  // }

  // await rpo.updateDetails(id, otherServicesData);

  let country = await rpo.getByIdM(id);


  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  // if ( trademarks[0].serialNumber ) {
  //   let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
  //   trademarks = await rpo.getById(id);
  // }
  
  res.render('admin/country/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    country: country[0]
  });
    
}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let country = await rpo.getByIdM(id);
  
  res.render('admin/country/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    country: country[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = req.body;
  let uploadPath;

  // console.log(req.files);

  // CHECK FLAG
  if ( req.files && req.files.flag ) {

    let extFlag = req.files.flag.name.match(/\.[0-9a-z]+$/i)[0]
    updateData.flag = req.files.flag.md5 + extFlag;

    uploadPath = __dirname + '/../public/uploads/flag_banner/' + req.files.flag.md5 + extFlag;

    await req.files.flag.mv(uploadPath, function(err) {
      // if (err) {
      // } else {
        
      // }
        
    });

  }

  // CHECK BANNER
  if ( req.files && req.files.banner ) {

    let extBanner = req.files.banner.name.match(/\.[0-9a-z]+$/i)[0]
    updateData.banner = req.files.banner.md5 + extBanner;
    uploadPath = __dirname + '/../public/uploads/flag_banner/' + req.files.banner.md5 + extBanner;

    await req.files.banner.mv(uploadPath, function(err) {
      // if (err) {
      // } else {
      //   updateData.banner = req.files.banner.md5 + extBanner;
      // }
        
    });

  }

  // CHECK LOGO
  if ( req.files && req.files.logo ) {

    let extLogo = req.files.logo.name.match(/\.[0-9a-z]+$/i)[0]
    updateData.logo = req.files.logo.md5 + extLogo;
    uploadPath = __dirname + '/../public/uploads/flag_banner/' + req.files.logo.md5 + extLogo;

    await req.files.logo.mv(uploadPath, function(err) {
      // if (err) {
      // } else {
      //   updateData.logo = req.files.logo.md5 + ext;
      // }
        
    });

  }

  
  // updateData.flag = req.files.flag.name
  
  await rpo.updateDetails(id, updateData);
  
  
  // UPDATE CONTINENTS
  let country = await rpo.getByIdM(id);
  let countries = await rpo.getByContinent(country[0].continent_id)
  let continent = await rpoContinents.getContinentID(country[0].continent_id)
  let dataContinentUpdate = {
    countries : countries
  } 
  await rpoContinents.updateDetails(continent[0]._id,dataContinentUpdate)



  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/country/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


