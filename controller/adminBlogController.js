var rpo = require('../repositories/articles');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let articles = await rpo.getAllNotContent();
  
  res.render('admin/articles/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    articles: articles
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

  let articles = await rpo.getById(id);


  // CHECK SERIAL NUMBER IF FOUND THEN FETCH UPDATED DATA FROM TSDR
  // if ( trademarks[0].serialNumber ) {
  //   let crawl = await crawlerService.fetchTsdr(trademarks[0].serialNumber);
  //   trademarks = await rpo.getById(id);
  // }
  
  res.render('admin/articles/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    article: articles[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  // let user = await rpo.getByIdM(id);
  
  res.render('admin/articles/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard'
  });
    
}

exports.addSubmit = async function(req, res, next) {


  // generate slug
  let slug =  req.body.title;
  slug = slug.toLowerCase()
            .replace(/ /g,'-')
            .replace(/[^\w-]+/g,'')
            

  // console.log(req.body.title,slug);

  let checkSlug = await rpo.getArticleSlugM(slug)
  // console.log(checkSlug);
  if ( checkSlug && checkSlug.length > 0) {
    // show error
    res.flash('error', 'Found Same Title');
    res.flash('title', req.body.title);
    res.flash('status', req.body.status);
    res.flash('content', req.body.content);
    // history.goBack();
    res.redirect('/njs-admin/manage/articles/add');
  } else {
    // store
     let articleData = req.body
     articleData.slug = slug
     articleData.created_at = toInteger(moment().format('YYMMDD'))
     articleData.created_at_formatted = moment().format()

    await rpo.storeArticle(articleData);

    res.flash('success', 'Added successfully!');
    res.redirect('/njs-admin/manage/articles/');
  }

  
  next()
  

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let articles = await rpo.getById(id);
  
  res.render('admin/articles/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    article: articles[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = req.body;


  await rpo.update(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/articles/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


