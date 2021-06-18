var rpo = require('../repositories/videos');


var actionService = require('../services/actionService');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let videos = await rpo.getAll();

  // let videosSQL = await rpo.getAllVideosSQL();

  // await videosSQL.forEach(async video => {
  //   let vidData = {
  //     title: video.title,
  //     slug: video.slug,
  //     description: video.description,
  //     created_at : toInteger(moment(video.created_at).format('YYMMDD')),
  //     created_at_formatted : moment(video.created_at).format()
  //   }

  //   rpo.put(vidData);
  // });
  
  res.render('admin/videos/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    videos: videos
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];
  let videos = await rpo.getById(id);

  res.render('admin/videos/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    video: videos[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  // let countries = await rpoCountries.getAll();
  
  res.render('admin/videos/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
  });
    
}

exports.addSubmit = async function(req, res, next) {

  let slug =  req.body.title;
  slug = slug.toLowerCase()
            .replace(/ /g,'-')
            .replace(/[^\w-]+/g,'')

  let data = req.body

  let checkSlug = await rpo.getVideosSlug(slug)
  
  

  if ( checkSlug && checkSlug.length > 0) {
    // show error
    res.flash('error', 'Found Same Title');
    res.redirect('/njs-admin/manage/videos/add');
  } else {
    // store
    data.slug = slug
    data.created_at = toInteger(moment().format('YYMMDD'))
    data.created_at_formatted = moment().format()

    await rpo.put(data);

    res.flash('success', 'Added successfully!');
    res.redirect('/njs-admin/manage/videos/');
  }

  // await rpo.put(data)

  // res.flash('success', 'Added successfully!');
  // res.redirect('/njs-admin/manage/videos/');

  
  next()
  

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let videos = await rpo.getById(id);
  // let countries = await rpoCountries.getAll();
  
  res.render('admin/videos/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    video: videos[0],
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = req.body

  // updateData.res.discountExp = toInteger(moment(updateData.res.discountExp).format('YYMMDD'))

  await rpo.update(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/videos/');

}

exports.deleteRecord = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpo.remove(req.params.id)

  console.log("res", result);
  res.flash('success', 'Deleted successfully!');
  res.redirect('/njs-admin/manage/videos/');

}


