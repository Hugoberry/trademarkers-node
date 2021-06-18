const { NetworkAuthenticationRequire } = require('http-errors');
const variables = require('../config/variables');
var db = require('../config/database');
var formidable = require('formidable');
var fs = require('fs');
var open = require('open');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.PAYTEST);
var bcrypt = require('bcrypt');

var path    = require('path');
var pdf2img = require('pdf2img');

var rpoContinents = require('../repositories/continents');
var rpoCountries = require('../repositories/countries');
var rpoPdfs = require('../repositories/generatedPdf');
var rpoSenders = require('../repositories/senders');
var rpoAction = require('../repositories/actionCode');
var rpoClasses = require('../repositories/classes');
var rpoTrademarks = require('../repositories/trademarks');
var rpoTrademarksMongo = require('../repositories/mongoTrademarks');
var rpoCharge = require('../repositories/charges');
var rpoOrder = require('../repositories/orders');
var rpoSouNotifications = require('../repositories/souNotifications');
var rpoUserMongo = require('../repositories/usersMongo');
var rpoPrices = require('../repositories/prices');
var rpoTrademarkClasses = require('../repositories/trademarkClasses');
var rpoArticles = require('../repositories/articles');
var rpoVideos = require('../repositories/videos');

var rpoEuipo = require('../repositories/euipo');


var rpoServiceAction = require('../repositories/serviceAction');

var activityService = require('../services/activityLogService');
var pdfService = require('../services/pdfService');
var checkoutService = require('../services/checkoutService');
var mailService = require('../services/mailerService');
var orderService = require('../services/orderService');
var crawlerService = require('../services/crawlerService');

var helpers = require('../helpers');

let moment = require('moment');

const emailValidator = require('deep-email-validator');

const { toInteger } = require('lodash');
const { redirect } = require('./customerController');

const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
const { Readable } = require('stream')


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// var log = require('../services/activityLogService');


exports.home = async function(req, res, next) {

  // let tet = await rpoEuipo.getAll();
  // console.log('eu',tet);

    activityService.logger(req.ip, req.originalUrl, "Visited Homepage", req);

    var getClientIp = req.headers['x-real-ip'] || req.connection.remoteAddress;

    let continents = await rpoContinents.getContinents();



    let continentsFormatted = [];

    await continents.forEach(async continent => {

      if ( continent.countries.length <= 0 ) {
        // console.log("##################################");
        // console.log("continent empty", continent.name);

        let countries = await rpoContinents.getCountryPerContinentMysql(continent.id)
        let dataContinentUpdate = {
          countries : countries
        } 
        await rpoContinents.updateDetails(continent._id,dataContinentUpdate)

        continent.countries = countries
      }

      let op = continent.countries.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

      
      // ES6 FILTER REMOVE DUPLICATES
      op = op.filter((o, index, self) =>
        index === self.findIndex((t) => (
          t.name === o.name
        ))
      )

      continent.countries = op;

      continentsFormatted.push(continent);

    });

    let user = await helpers.getLoginUser(req);

    res.render('public/index', { 
      layout: 'layouts/public-layout', 
      title: 'Trademarkers LLC',
      description: '195 Countries and Treaty Regions can provide you with fast, simple, and cost-efficient trademark filing services',
      keywords: 'Trademarkers LLC, trademark registration, register a trademark, trademark, trade mark, register a trade mark, trade mark registration',
      continents: continentsFormatted,
      user: user
    });
     
}

exports.about = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited About Page", req);

  let user = await helpers.getLoginUser(req);

  res.render('public/about', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademarkers LLC | About',
    description: 'Trademarkers is a leading international brand protection company that specializes in global trademark registration',
    keywords: 'years of experience in Trademark Registrations, experience in Trademark Registrations, intellectual property attorneys, large businesses trademarking their brands',
    user: user
  });
}

exports.terms = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Terms Page", req);
  let user = await helpers.getLoginUser(req);

  res.render('public/terms', { 
    layout: 'layouts/public-layout-default', 
    title: 'terms',
    user: user
  });
}

exports.privacy = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Privacy Page", req);

  res.render('public/privacy', { 
    layout: 'layouts/public-layout-default', 
    title: 'privacy',
    user: await helpers.getLoginUser(req)
  });
}

exports.register = async function(req, res, next) {
// console.log('register');
  activityService.logger(req.ip, req.originalUrl, "Visited registration Page", req);
  let user = await helpers.getLoginUser(req)

  if ( user ) {
    res.redirect("/customer")
  }
  // console.log('passed');
  res.render('public/register', { 
    layout: 'layouts/public-layout-default', 
    title: 'service',
    user: user
  });
}

exports.registerSubmit = async function(req, res, next) {

  var hash = bcrypt.hashSync(req.body.password, 10); 

  hash = hash.replace("$2b$", "$2y$");

  let flag = true
  let custNo = ""

  for ( ; flag; ) {
      custNo = "CU-" + helpers.makeid(4)

      let dataCustomer = await rpoUserMongo.findUserNo(custNo)
      // console.log("check user", dataCustomer.length );
      if ( dataCustomer.length <= 0 ) {
          flag = false
      }
  }

  let userData = {
    name: req.body.lname + ", " + req.body.fname,
    firstName:req.body.fname,
    lastName:req.body.lname,
    email: req.body.email,
    secondaryEmail: req.body.email,
    password: hash,
    custNo: custNo,
    created_at: toInteger(moment().format('YYMMDD')),
    created_at_formatted: moment().format()
  }
  let newUser = await rpoUserMongo.putUser(userData);

  newInsertedUser = await rpoUserMongo.getByIdM(newUser.insertedId);

  helpers.setLoginUser(res,newInsertedUser[0])
  // currentUser = newInsertedUser[0]

  // currentUser._id = newUser.insertedId
  // let payload = {user: JSON.stringify(currentUser)}

  // let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
  // expiresIn: process.env.ACCESS_TOKEN_EXPIRES
  // });

  // res.cookie("jwt", accessToken);
  
  // let data = {
  //   firstName: req.body.fname,
  //   lastName: req.body.lname,
  //   email: req.body.email,
  // }


  res.redirect("/customer/profile"); 
}

exports.service = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Service Page", req);

  let countries = await rpoCountries.getAll();

  res.render('public/service', { 
    layout: 'layouts/public-layout-default', 
    title: 'service',
    countries: countries,
    user: await helpers.getLoginUser(req)
  });
}

exports.monitoringService = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited monitoring Service Page", req);

  let countries = await rpoCountries.getAll();

  res.render('public/monitoring-service', { 
    layout: 'layouts/public-layout-default', 
    title: 'monitoring Service',
    countries: countries,
    user: await helpers.getLoginUser(req)
  });
}

exports.quote = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Quote Page", req);

  let countries = await rpoCountries.getAll();

  // console.log("req", req.params.type);

  let knownQuoteServices = [
    'office action response',
    'trademark statement of use',
    'revive an abandoned application',
    'international trademark application',
    'trademark renewal',
    'change or update trademark owner',
    'letter of protest for domain owners',
    'letter of protest for prior registered tm holders',
    'trademark opposition',
    'negotiate a settlement',
    'cease and desist',
    'draft a settlement agreement',
    'appeal a final refusal'
  ];

  // console.log(req.params.type);

  if ( !req.params.type ) {
    res.redirect("/services"); 
  } else {
    req.params.type = req.params.type.replace(/[-]/g," ");
  }

  if ( !knownQuoteServices.includes(req.params.type) ) {
    res.redirect("/services"); 
  }

  res.render('public/quoteForm', { 
    layout: 'layouts/public-layout-default', 
    title: 'service',
    countries: countries,
    data: req.params,
    user: await helpers.getLoginUser(req)
  });
}

exports.quoteSubmit = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Submitted Quote Page", req);

  // let countries = await rpoCountries.getAll();

  // console.log("req", req.body.type);

  // if ( !req.body.type ) {
  //   res.redirect("/services"); 
  // } else {
  //   req.params.type = req.params.type.replace(/[-]/g," ");
  // }


  let type = req.body.quoteType.replace(/\s/g, '-');
   mailService.sendQuote(req.body);
  // console.log('test mailing ',mailInfo);
  // if (mailInfo && mailInfo.accepted) {
    res.flash('success', 'Thank You! Your message has been successfully sent. We’ll get back to you very soon.');
  // } else {
  //   res.flash('error', 'Sorry, something went wrong, try again later!');
  // }

  // console.log("redirect ",req.body.formLocation);


  res.redirect("/quote/" + type); 
}

exports.cookies = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Cookies Page", req);

  res.render('public/cookies', { 
    layout: 'layouts/public-layout-default', 
    title: 'cookies',
    user: await helpers.getLoginUser(req)
  });
}

exports.blog = async function(req, res, next) {

  let searchTerm = '', pageNo=1, perPage=10;

  if ( req.body.articleName ) {
    activityService.logger(req.ip, req.originalUrl, "Search Article "+req.body.articleName, req);
    searchTerm = req.body.articleName;
  } else {
    activityService.logger(req.ip, req.originalUrl, "Visited Blog Page", req);
  }

  let allArticles = await rpoArticles.getTotalCount();
  
  let articles;

  if (searchTerm) {
    articles = await rpoArticles.getArticlesM(searchTerm);
    allArticles = articles.length
  } else {
    if ( req.params.pageNo ) {
      pageNo = req.params.pageNo * 1;
    }
  
    if ( req.params.perPage ) {
      perPage = req.params.perPage * 1
    }

    articles = await rpoArticles.getAllArticlesPaginatedM( perPage, ((pageNo - 1) * perPage) );

  }

  let pageTotal = allArticles;
  let pTotal = Math.ceil(pageTotal  / perPage)

  res.render('public/blog', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademarkers LLC | Blog',
    articles: articles,
    searchTerm: searchTerm,
    pageNo: pageNo,
    perPage: perPage,
    pageTotal: pTotal,
    user: await helpers.getLoginUser(req)
  });
}

exports.blogPost = async function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Blog Page", req);
  // console.log(req.params.slug);

  let articles = await rpoArticles.getArticleSlugM(req.params.slug);



  res.render('public/blogPost', { 
    layout: 'layouts/public-layout-default', 
    title: (articles[0] ? articles[0].title : '') +' | Trademarkers LLC',
    description: articles[0] && articles[0].description ? articles[0].description : '',
    keywords: articles[0] && articles[0].keywords ? articles[0].keywords : articles[0].title,
    article: articles[0],
    user: await helpers.getLoginUser(req)
  });
}

// FOR SITEMAP VIEW
exports.blogXML = async function(req, res, next) {

  let sitemap

  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  // if we have a cached entry send it
  if (sitemap) {
    res.send(sitemap)
    return
  }

  let articles = await rpoArticles.getAllSlug();

  // console.log(articles);

  try {
    const smStream = new SitemapStream({ hostname: 'https://www.trademarkers.com' })
    const pipeline = smStream.pipe(createGzip())

    // pipe your entries or directly write them.
    // smStream.write({ url: '/page-1/',  changefreq: 'daily', priority: 0.3 })
    // smStream.write({ url: '/page-2/',  changefreq: 'monthly',  priority: 0.7 })
    // smStream.write({ url: '/page-3/'})    // changefreq: 'weekly',  priority: 0.5
    // smStream.write({ url: '/page-4/',   img: "http://urlTest.com" })

    await articles.forEach(async article => {
      smStream.write({ url: '/blog/'+article.slug,  changefreq: 'daily',  priority: 0.7 })
    })

    // cache the response
    streamToPromise(pipeline).then(sm => sitemap = sm)
    // make sure to attach a write stream such as streamToPromise before ending
    smStream.end()
    // stream write the response
    pipeline.pipe(res).on('error', (e) => {throw e})
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

exports.contact = function(req, res, next) {

  // activityService.logger(req.ip, req.originalUrl, "Visited Contact Page");

  res.redirect("/");

  // res.render('public/contact', { layout: 'layouts/public-layout-default', title: 'contact' });
}

exports.classes = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Classes Page", req);

  let classes = await rpoClasses.getAll();

  res.render('public/classes', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademark Class Descriptions',
    classes: classes,
    user: await helpers.getLoginUser(req)
  });
}

exports.classesId = async function(req, res, next) {

  console.log(req.params.id);
 
  activityService.logger(req.ip, req.originalUrl, "Search Class " + req.params.id, req);

  let classes = await rpoClasses.getAllSearchId((req.params.id * 1));



  res.render('public/classesDescription', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademark Class Descriptions',
    classes: classes,
    searchTerm: req.body.desc,
    user: await helpers.getLoginUser(req)
  });
}

exports.classDescription = async function(req, res, next) {

  // console.log(req.body);
  if (!req.body.desc) {
    res.redirect('/classes');
  }
  activityService.logger(req.ip, req.originalUrl, "Search Class " + req.body.desc, req);

  let classes = await rpoClasses.getAllSearch(req.body.desc);



  res.render('public/classesDescription', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademark Class Descriptions',
    classes: classes,
    searchTerm: req.body.desc,
    user: await helpers.getLoginUser(req)
  });
}

exports.resources = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Resources Page", req);

  res.render('public/resources', { 
    layout: 'layouts/public-layout-default', 
    title: 'resources',
    user: await helpers.getLoginUser(req)
  });
}

exports.videos = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Videos Page", req);

  let videos = await rpoVideos.getAll()

  res.render('public/videos', { 
    layout: 'layouts/public-layout-default', 
    title: 'resources',
    user: await helpers.getLoginUser(req),
    videos: videos
  });
}

exports.videos = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Videos Page", req);

  let videos = await rpoVideos.getAll()

  res.render('public/videos', { 
    layout: 'layouts/public-layout-default', 
    title: 'resources',
    user: await helpers.getLoginUser(req),
    videos: videos
  });
}

exports.videoDetails = async function(req, res, next) {

  

  let video = await rpoVideos.getVideosSlug(req.params.slug)
  let videos = await rpoVideos.getAll5()

  activityService.logger(req.ip, req.originalUrl, "Watched Video " + video[0].title, req);

  res.render('public/videoDetails', { 
    layout: 'layouts/public-layout-default', 
    title: 'resources',
    user: await helpers.getLoginUser(req),
    video: video[0],
    videos: videos
  });
}

exports.prices = async function(req, res, next) {
 
  activityService.logger(req.ip, req.originalUrl, "Visited Price Page", req);

  let continents = await rpoContinents.getContinents();
  let continentsFormatted = [];

  await continents.forEach(async continent => {

    let op = continent.countries.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

    
    // ES6 FILTER REMOVE DUPLICATES
    op = op.filter((o, index, self) =>
      index === self.findIndex((t) => (
        t.name === o.name
      ))
    )

    continent.countries = op;
    continentsFormatted.push(continent);
    


  });
  let prices = await rpoPrices.getAll()
  let formattedPrices = []
  await prices.forEach(price => {
    let data = {
      initial_cost: price.initial_cost,
      additional_cost: price.additional_cost,
      logo_initial_cost: price.logo_initial_cost,
      logo_additional_cost: price.logo_additional_cost,
    }

    if ( typeof formattedPrices[price.country_id] == "undefined" ) {
      formattedPrices[price.country_id] = {
        study: [],
        registration: [],
        certificate: []
      }
    }

    if ( price.service_type == "Study" ) {
      formattedPrices[price.country_id].study = price
    } else if ( price.service_type == "Registration" ) {
      formattedPrices[price.country_id].registration = price
    } else if ( price.service_type == "Certificate" ) {
      formattedPrices[price.country_id].certificate = price
    }

  })


  console.log('key ',formattedPrices);
  
  res.render('public/prices', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademark Pricing',
    continents: continentsFormatted,
    prices: formattedPrices,
    user: await helpers.getLoginUser(req)
  });
}


exports.service_contract = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Service Page", req);

  res.render('public/service_contract', { 
    layout: 'layouts/public-layout-default', 
    title: 'service_contract',
    user: await helpers.getLoginUser(req)
  });
}

exports.udrp = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited UDRP Page", req);

  res.render('public/udrp', { 
    layout: 'layouts/public-layout-default', 
    title: 'Uniform Domain-Name Dispute-Resolution Policy',
    user: await helpers.getLoginUser(req)
  });
}

exports.countries = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Countries Page", req);

  let continents = await rpoContinents.getContinents();
  let continentsFormatted = [];

  await continents.forEach(async continent => {

    let op = continent.countries.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

    
    // ES6 FILTER REMOVE DUPLICATES
    op = op.filter((o, index, self) =>
      index === self.findIndex((t) => (
        t.name === o.name
      ))
    )

    continent.countries = op;

    continentsFormatted.push(continent);

  });

  res.render('public/countries', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademark Registration Countries',
    continents: continentsFormatted,
    user: await helpers.getLoginUser(req)
  });
}

exports.countriesAbbr = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited Continent "+ req.params.abbr, req);
  let abbr = req.params.abbr
  let continents = await rpoContinents.getContinentAbbr(abbr);

  res.render('public/countriesAbbr', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademark Registration Countries',
    continent: continents[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.fourthCircuit = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited 	The Fourth Circuit dismisses Nike’s appeal over injunction by District Court Page", req);

  res.render('public/fourthCircuit', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademarkers | The Fourth Circuit dismisses Nike’s appeal over injunction by District Court',
    description: 'Fleet Feet Inc, through franchises, company-owned retail stores, and online stores, sells running and fitness merchandise, and has 182 stores, including franchises, nationwide in the US. Fleet Feet is the owner of trademark “Change Everything” and “Running Changes Everything” used widely for its sports and apparel related goods and services. Nike, Inc., and Nike Retail Services, Inc. (collectively, “Nike”)',
    keywords: 'Trademarkers, The Fourth Circuit dismisses, Fleet Feet Inc, Nike’s appeal over injunction by District Court',
    user: await helpers.getLoginUser(req)
  });
}

exports.circuitAffirms = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Visited 	Federal Circuit affirms TTAB decision on refusal of design registration due to functionality Page", req);

  res.render('public/circuitAffirms', { 
    layout: 'layouts/public-layout-default', 
    title: 'Trademarkers | Federal Circuit affirms TTAB decision on refusal of design registration due to functionality',
    description: 'For the purpose of packaging of finished coils of cable and wire, Reelex Packaging Solutions, Inc. (“Reelex”) filed for the registration of its box designs under International Class 9 at the United States Patent and Trademark Office (“USPTO”). The examining attorney refused to register the two box designs for electric cables and wire on grounds',
    keywords: 'Trademarkers, Federal Circuit affirms TTAB decision, TTAB decision on refusal of design, Proprietary winding machines wind cable, Reelex Packaging Solutions',
    user: await helpers.getLoginUser(req)
  });
}

exports.redirect = async function(req, res, next) {

  // console.log(req.params.action);

  let action = await rpoAction.getAction(req.params.action);

  if ( action.length > 0 ) {

    // console.log(action[0].redirect_to, 'redirecting');

    if ( action[0].related_data && action[0].related_data.email) {

      activityService.trackingEmail(req.ip,action[0]);


    }

    if ( action[0].redirect_to ) {
      // console.log('');
      if ( typeof action[0].redirect_to !== 'undefined' ) {
        // console.log(action[0].redirect_to, 'step1');
        res.redirect("https://www.trademarkers.com"+action[0].redirect_to);
      } else {
        // console.log(action[0].url, 'step2');
        res.redirect("https://trademarkers.com"+action[0].redirect_to);
      }
      
    } else {

      if ( req.params[0] && typeof req.params[0] !== 'undefined') {
        // console.log(action[0].url, 'step3');
        let urlPhp = process.env.APP_URL_PHP;
        res.redirect(urlPhp + req.params[0]);
        
      } else {
        res.redirect("https://www.trademarkers.com");
      }
      // console.log(action[0].redirect_to, 'step4');
      // res.redirect("https://www.trademarkers.com");
    }
    
  } else {
    // activityService.logger(req.ip, req.originalUrl, "Visitor redirected to laravel: " + req.params[0], req);
    let urlPhp = process.env.APP_URL_PHP;
    
    let redirectUrl = (req.params[0] ? req.params[0] : (req.params.action ? req.params.action : null));

    if (redirectUrl) {
      res.redirect(urlPhp + "/" + redirectUrl);

    } else {
      res.redirect(urlPhp + '/home');
    }

    
  } 

}

exports.ytVideo = async function(req, res, next) {

  let ytId = req.params.ytId;

  activityService.logger(req.ip, req.originalUrl, "Checking YT video " + ytId, req);

  res.render('video/index', { 
    layout: 'layouts/public-layout', 
    title: 'Youtube Videos', 
    ytId: ytId,
    user: await helpers.getLoginUser(req)
  });
}

exports.submitContact = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Submitted Contact Form", req);

  // filter body to avoid spam
  var urlRE= new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");
  


  // const {valid} = await isEmailValid(req.body.email);

  let trap = false

  let message = req.body.message
  let noWords = message.split(" ");

  if (  message.includes("sex") ||
        message.includes("nude") ||
        message.includes("porn") ||
        message.includes("Sexy") ||
        message.includes("penis") ||
        message.includes("vagina") ||
        message.includes("fuck") ||
        message.includes("shit") ||
        message.includes("bullshit") ||
        message.includes("http") ||
        message.includes("https") ||
        message.includes("www")
  ){
    trap = true
  }

  if ( trap || !req.body.message.trim() || req.body.message.match(urlRE) || noWords.length < 2 ){
    // console.log('found!');
    res.flash('errorContact', 'Sorry, something went wrong, try again later!');
    
  } else {
    let mailInfo = await mailService.contact(req.body);
    console.log('test mailing ',mailInfo);
    if (mailInfo && mailInfo.accepted) {
      res.flash('successContact', 'Your Inquiry has been sent!');
    } else {
      res.flash('errorContact', 'Sorry, something went wrong, try again later! 2');
    }


  }

  // let mailInfo = await mailService.contact(req.body);
  // console.log('test mailing ',mailInfo);
  // if (mailInfo && mailInfo.accepted) {
  //   res.flash('successContact', 'Thank You! Your message has been successfully sent. We’ll get back to you very soon.');
  // } else {
  //   res.flash('errorContact', 'Sorry, something went wrong, try again later!');
  // }

  console.log("redirect ",req.body.formLocation);

  if ( req.body.formLocation && req.body.formLocation == 'home' ) {
    console.log('home');
    res.redirect("/");
  } else {
    console.log('contact');
    res.redirect("/contact");
  }

} 

exports.generatePdf = async function(req, res, next) {

  let pdfs = await rpoPdfs.getGeneratedPdfs();
  let senders = await rpoSenders.getSenders();

  activityService.logger(req.ip, req.originalUrl, "Visited pdf generator Page", req);

  res.render('public/generate_pdf', { 
    layout  : 'layouts/public-layout-default', 
    title   : 'Generate Pdf', 
    pdfs    : pdfs,
    senders : senders,
    user: await helpers.getLoginUser(req)
  });
}

exports.generatePdfView = async function(req, res, next) {

  activityService.logger(req.ip, req.originalUrl, "Generate pdf", req);

  let pdfName = await pdfService.generate(req.body);
  let fullUrl = 'https://' + req.get('host') + '/pdf/' + pdfName;
console.log(fullUrl);
  res.flash('success', 'Generated PDF!');
  res.flash('fullUrl', fullUrl);

  open( fullUrl, function (err) {
    if ( err ) {
      console.log(err,'error')
      throw err;
    }    
  });

  res.redirect("/generate-pdf");
}

exports.addSenderPdf = async function(req, res, next) {

  let now = Date.now();

  let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      
 
      if (files.logo.name) {

        let oldLogopath = files.logo.path;
        let newLogopath = variables.filePathUpload + now + "-" +files.logo.name;

        fs.rename(oldLogopath, newLogopath, function (err) {
          if (err) throw err;

        });

        fields.logo = now + "-" +files.logo.name;

      } else {
        fields.logo = '';
      }

      if (files.signature.name) {

        let oldsignaturepath = files.signature.path;
        let newsignaturepath = variables.filePathUpload + now + "-" +files.signature.name;

        fs.rename(oldsignaturepath, newsignaturepath, function (err) {
          if (err) throw err;
     
        });

        fields.signature = now + "-" +files.signature.name;

      } else {
        fields.signature = '';
      }

      rpoSenders.putSenders(fields);
      
      res.flash('success', 'Created new Sender!');
      res.redirect("/generate-pdf");

      
    });

    // res.end();

  // res.render('public/generate_pdf', { layout: 'layouts/public-layout-default', title: 'Generate Pdf', pdfs: pdfs });
}

exports.codeLanding = async function(req, res, next) {

  let code = req.params.actionCode;
  let type = req.params.type;
  let secretAmountDecode = '', secretDescription='', secretCustomer='';

  // LOOK FOR A WAY TO REDIRECT CUSTOMER AND PREFILLED FORM
  // OR CREATE A NEW NODEJS SETUP FOR ADDING TO CART IN MYSQL

  let countries = await rpoCountries.getAll();
  let classes = await rpoClasses.getAll();
  let actions = await rpoAction.getAction(code);
  let action = actions[0] ? actions[0] : null;
  let secretAmount;

  let title = "", layout = "layouts/public-layout-default";
  let classArr = [];
  let render = 'trademark-order/register';

  let casesMysql = null, trademarkMysql = null, trademark = null;

  // ACTIVITY LOG
  activityService.trackingEmailSOU(req.ip,action);

  // let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  // console.log('this ip>>>>>>',req.ip);
  if ( action && action.case ) {
    classArr = action.case.nice.split(',').map(s => s.trim());
  }

  if ( action && action.trademark ) {
    classArr = action.trademark.classes.split(',').map(s => s.trim());
  }

  // check if has action
  //  or action is a serial number
  if ( !action || !action.actionType) {
    // empty action and search if there is a matching serial number
    action = {};
    // let crawl = await usptoCrawlService.usptoCrawl('1999445')
    casesMysql = await rpoTrademarks.fetchTmBySerial(code)

    // console.log("casesMysql",casesMysql)
    if (casesMysql.length) {
      trademarkMysql = await rpoTrademarks.fetchTmByMark(casesMysql[0].trademark);

      if (trademarkMysql.length) {
        action.serialNumber = code;
        action.trademark = trademarkMysql[0]
      }

    } 


  } else {
    action = actions[0];
  }

  
  if (type)
  switch(type){
    case 'trademark-registration' :
      title = "Trademark Registration"
      layout = 'layouts/public-layout-default'
    break;

    case 'trademark-study' :
      title = "Trademark Study"
      layout = 'layouts/public-layout-default'
    break;

    case 'recommendation' :
      title = "Our Recommendations"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/recommendation'
    break;

    case 'statement-of-use' :
      title = "Statement of Use"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/sou'

      // add open here
      let souData = {
        noClick: (action.tracking ? action.tracking.length : 0)
      }
      let souRec = await rpoSouNotifications.findBySerial(action.serialNumber)

      await rpoSouNotifications.updateDetails(souRec[0]._id, souData);

    break;

    case 'pay' :
      title = "Payment Page"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/payment'

      // console.log('check auth');
      // let getCurrentUser = await helpers.getLoginUser(req);

      // console.log(getCurrentUser);
      // if ( !getCurrentUser ) {
      //   res.redirect("/login"); 
      // }

    break;

    case 'delivery' :
      title = "Trademark Certificate"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/delivery'

      // let trdId = req.params.trdId;
      // let trademark = null;

      if ( code ) {
        trademark = await rpoTrademarks.fetchTmById(code)

        if (trademark) {
          action = {};
          action.serialNumber = code;
          action.userId = trademark[0].user_id;
          action.trademark = trademark[0]
          action.actionType = "Certificate Delivery"
          action.number = code
          trademark = trademark[0]

          // save action if code does not exist
          rpoAction.put(action);
          
        } else {
          trademark = null
        }
      }

    break;

    // case 'thankyou' :
    //   title = "Thank You!"
    //   layout = 'layouts/public-layout-interactive'
    //   render = 'trademark-order/thankyou'
    // break;

    case 'abandon' :
      title = "Abandon Confirmation"
      layout = 'layouts/public-layout-interactive'
      render = 'trademark-order/abandon'
    break;

    default:
      if (code == "pay") {
        title = "Statement of Use"
        layout = 'layouts/public-layout-interactive'
        render = 'trademark-order/checkout-order'

        let arrType = type.split('-')
        let arrTypeValue = arrType[0]
        type = arrTypeValue
        if (!arrTypeValue) {
          res.redirect('/service-order/pay');
        }

        if ( typeof arrType[1] !== "undefined" ) {
          secretCustomer = arrType[1]
        }

        for (let i = 0; [...arrTypeValue].length > i; i++) {

          if ( typeof variables.secretAmount[[...arrTypeValue][i]] == 'undefined' ) {
            console.log(i,'found not declared variable');
            res.redirect('/service-order/pay');
          }

        }

        let arrSecret = await helpers.convertSecretCode([...arrTypeValue]);

        // console.log(arrSecret);
        secretAmountDecode = parseInt(arrSecret.secretAmountDecode);
        secretDescription = arrSecret.secretDescription;
      }
      // res.redirect('/');
    break;
  }

  // res.locals = {
  //   siteTitle: "Trademark Search",
  //   description: "Check trademark status",
  //   keywords: "Trademark Status, trademarkers status",
  // };

  res.render(render, { 
    layout  : layout, 
    title   : title,
    countries: countries,
    classes: classes,
    action : action,
    classArr: classArr,
    tkey: process.env.PAYK,
    trademark: trademark,
    user: await helpers.getLoginUser(req),
    secretAmountDecode: secretAmountDecode,
    secretDescription: secretDescription,
    secretCustomer: secretCustomer,
    code: type

  });

  // res.send()

}


exports.deliveryMethod = async function(req, res, next) {

  let trdId = req.params.trdId;
  let trademark = null;
  let trademarkCertificate = null;
  let pdfUrl = '', pngName = '', pdfName='';
  let user;

  if ( trdId ) {

    activityService.logger(req.ip, req.originalUrl, "Customer visited certificate delivery " +trdId, req);

    trademark = await rpoTrademarksMongo.getBySerial(trdId)
    
    if (trademark[0] && trademark[0].certificate) {

      user = await rpoUserMongo.getByIdM(trademark[0].userId)
      

      // CHECK IF ALREADY PURCHASED

        pdfUrl = "/uploads/certificate/"+ trademark[0].certificate.customName;
        console.log(pdfUrl.toLowerCase());
        pdfName = trademark[0].certificate.customName
        pngName = pdfName
 

        var input   = __dirname + "/../public/uploads/certificate/" + pdfName;
        console.log("creating png");
        pdf2img.setOptions({
          type: 'png',                                // png or jpg, default jpg
          size: 1024,                                 // default 1024
          density: 600,                               // default 600
          outputdir: __dirname + path.sep + '../public/pdf/png', // output folder, default null (if null given, then it will create folder name same as file name)
          outputname: pngName,                         // output file name, dafault null (if null given, then it will create image name same as input name)
          page: null,                                 // convert selected page, default null (if null given, then it will convert all pages)
          quality: 100                                // jpg compression quality, default: 100
        });

        // console.log(input);
        
        let gen = await pdf2img.convert(input, function(err, info) {
          console.log("gen png");
          if (err) return err;
          else return info;
        });
        
        console.log(gen);
      

    } else { // end if trademark
      activityService.logger(req.ip, req.originalUrl, "Customer tried to visited certificate delivery page but no serial number found", req);
      res.redirect('/');
    } // end else trademark
  } else {
    activityService.logger(req.ip, req.originalUrl, "Customer tried to visited certificate delivery page but empty trademark serial", req);
    res.redirect('/');
  }
  // console.log(user[0]);

  
  // wait for the generated png files
  await new Promise(resolve => setTimeout(resolve, 5000));

  res.render('trademark-order/delivery', {
    layout  : 'layouts/public-layout-interactive', 
    title   : 'Your Trademark Certificate is now available!',
    trademark: trademark[0],
    pngName: pngName,
    pdfName: pdfName,
    user: user[0]
  });


  // res.send()

}

exports.souResponse = async function(req, res, next) {

  // console.log(req.params);
  // console.log(req.body);
  // res.send('asdsad')

  let response = 1;
  let name = req.query.decName ? req.query.decName : '';

  if (req.params.response == '1' ) {
    response = "Statement of Use";
  } else if(req.params.response == '2') {
    response = "Extension for trademark allowance";
  } else {
    response = "Decline";
  }

  let data = {
    response: response
  }

  if ( name ) {
    data.decName = name
  }

  // if ( name ) {
  //   data.declinedName = name
  // }

  let action = await rpoAction.get(req.params.action);
  let notif = await rpoSouNotifications.findBySerial(action[0].serialNumber);

  await rpoAction.updateDetails(req.params.action, data)

  // add this in notification
  await rpoSouNotifications.updateDetails(notif[0]._id, data)

  res.json({
    status:true,
    message:"Success"
  });

}

exports.checkout = async function(req, res, next) {

  // const stripe = require('stripe')(process.env.PAYTEST);

  // console.log(req.params);
  // console.log(process.env.PAYTEST);
  // console.log('body',req.body);

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 0;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "";
  let customer = req.body.email ? req.body.email : "";
// console.log('action', action);
  if ( action[0] && action[0].number) {
    price = await checkoutService.getPrice(req.body.action);

    if ( action[0].response ) {
      description += ": " + action[0].response;
    }

    action[0].ordered = 'yes'

    // update action
    let actionUpdates = {
      ordered: 'yes'
    }

    await rpoAction.updateDetails(action[0]._id, actionUpdates)

  } else {
    price = req.body.price ? (req.body.price * 1) : 0;
    description = req.body.description ? req.body.description : "";
    name = req.body.name ? req.body.name : "";
    payment = req.body.payment ? req.body.payment : "";
  }
// console.log('price', price);

  // 
  try{

  let orderCode = await orderService.createOrderCode();

  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description + " | " + customer + " | " + orderCode,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description + " | " + orderCode,
      'paymentFor' : payment
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: false,
      paid: true,
      action: action[0],
      userId: action[0] ? action[0].userId : '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    order.custEmail = customer;
    order.paymentFor = payment;
    order.paymentDescription = description;

    // send email notification
    mailService.sendOrderNotification(order);

    rpoOrder.put(order);
    rpoCharge.put(charge);
    res.flash('success', 'Payment Successful!');
    

    // update notifications collection
    if ( action[0] ) { 
      let notification = await rpoSouNotifications.findBySerial(action[0].serialNumber);
      let dataNotification = {
        actionType: "Ordered: " + action[0].response
      }
      rpoSouNotifications.updateDetails(notification[0]._id, dataNotification);
      // Ordered: Statement of Use
      // Ordered: Extension for trademark allowance
    }

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

  res.redirect("/"+req.body.action+'/pay'); 

}

// DELIVERY CHECKOUT ===============================
// =================================================
exports.checkoutDelivery = async function(req, res, next) {

  let trademark = await rpoTrademarksMongo.getById(req.body.trdId);

  if (!trademark) {
    // log and redirect to current page
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    activityService.logger(req.ip, req.originalUrl, "Failed, Customer tried to checkout certificate delivery with serial number " + req.body.serialNumber, req);
    res.redirect("/delivery-method/"+req.body.serialNumber); 
  }

  let user = await rpoUserMongo.getByIdM(trademark[0].userId);

  let price = 80;
  let description = "FedEx Delivery";
  let payment = "FedEx Delivery";
  let customer = req.body.email ? req.body.email : "";

  
  // 
  try{
    const charge = await stripe.charges.create({
      amount: (price * 100),
      currency: 'usd',
      source: req.body.stripeToken,
      description: description,
      // customer: customer,
      metadata : {
        'customer': "" + customer,
        'description': "" + description,
        'paymentFor' : payment,
        'customerName' : req.body.name,
        'customerAddress' : req.body.address
      },
      receipt_email: customer
    });

    if ( charge.paid ) {

      // 

      // save
      let orderCode = await orderService.createOrderCode();

      let order = {
        orderNumber: orderCode,
        charge: charge,
        custom: true,
        paid: true,
        userId: trademark[0].userId,
        user: user[0],
        content: trademark[0],
        trademarkId: trademark[0]._id,
        created_at: toInteger(moment().format('YYMMDD')),
        created_at_formatted: moment().format()
      }


      mailService.sendOrderNotification(order);
      
      rpoOrder.put(order);
      rpoCharge.put(charge);

      let trademarkDelivery = {
        delivery : trademark[0].delivery
      }

      trademarkDelivery.delivery.status = 'processing'; 
      trademarkDelivery.delivery.orderCode = orderCode; 

      rpoTrademarksMongo.updateDetails(trademark[0]._id, trademarkDelivery);

      console.log(trademark[0]);

      activityService.logger(req.ip, req.originalUrl, "Payment successfull "+ orderCode, req);

      res.redirect("/thank-you/"+orderCode); 
    } else {
      res.flash('error', 'Sorry!, Something went wrong, try again later.');
      
      activityService.logger(req.ip, req.originalUrl, "Failed, Customer tried to checkout certificate delivery with serial number " + req.body.serialNumber + " Stripe API call failed", req);
      res.redirect("/delivery-method/"+req.body.serialNumber); 

      // return with error
    }

  } catch (err) {
    // res.flash('error', err.error);
    // console.log("errors",err);
    // console.log("errors message",err.message);

    res.flash('error', 'Sorry!, Something went wrong, try again later.');
      
    activityService.logger(req.ip, req.originalUrl, "Failed, Customer tried to checkout certificate delivery with serial number " + req.body.serialNumber + " " + err.message, req);
    res.redirect("/delivery-method/"+req.body.serialNumber); 
  }

}




// CUSTOM PAGE SERVICE -------------------------------- START

exports.serviceOrderCustom = async function(req, res, next) {

  let order = await rpoOrder.findActionCustom('L3P-5T');

  activityService.logger(req.ip, req.originalUrl, "Visited service page L3P-5T", req);

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("trademark-order/service-order-L3P-5T", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    order: order[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.checkoutCustom = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  
  // compute price
  let price = 362.32;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "Monitoring and filing of progress";
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: 'L3P-5T',
      userId: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    console.log('put', order);

    order.custEmail = customer;

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "checkout L3P-5T", req);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/L3P-5T"); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

exports.serviceOrderCustom2 = async function(req, res, next) {

  let order = await rpoOrder.findActionCustom('L3P-5T');
  
  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  activityService.logger(req.ip, req.originalUrl, "Visited service page L3P-6T", req);
  console.log('check');
  res.render("trademark-order/service-order-L3P-6T", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    order: order[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.checkoutCustom2 = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;
  let action = await rpoAction.getAction(req.body.action);

  // compute price
  let price = 150;
  let description = "Trademarkers LLC Service";
  let name = "", payment = "Preparation and Filling of Assignment";
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: 'L3P-6T',
      userId: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    console.log('put', order);

    order.custEmail = customer;

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "checkout L3P-6T", req);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/L3P-6T"); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}


exports.serviceOrderShow = async function(req, res, next) {

  console.log(req.params.serviceCode);
  let serviceOrder = await rpoServiceAction.findByCode(req.params.serviceCode)
  
  activityService.logger(req.ip, req.originalUrl, "Visited service page " + req.params.serviceCode, req);

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("trademark-order/service-order", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    tkey: process.env.PAYK,
    serviceOrder: serviceOrder[0],
    user: await helpers.getLoginUser(req)
  });
}

exports.serviceOrderSubmit = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;

  let serviceCode = await rpoServiceAction.findByCode(req.body.code);

  if (serviceCode.length <= 0) {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
  }


  // compute price
  let price = serviceCode[0].amount;
  let description = serviceCode[0].name;
  let name = "", payment = serviceCode[0].description;
  let customer = req.body.email ? req.body.email : "";


  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'paymentFor' : payment,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    let orderCode = await orderService.createOrderCode();

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: req.body.code,
      userId: '',
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    console.log('put', order);

    order.custEmail = customer;

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "Checkout " + req.params.serviceCode, req);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

// SERVICE ORDER WITH SECRET CODE AMOUNT AND SERVICE
exports.serviceOrderCustom3 = async function(req, res, next) {

  req.body.stripeEmail = req.body.email;

  // compute price
  
  
  // let name = "", payment = serviceCode[0].description;
  let customer = req.body.email ? req.body.email : "";

  let arrSecret = await helpers.convertSecretCode([...req.body.code]);
  let orderCode = await orderService.createOrderCode();

  let description = arrSecret.secretDescription + " | " + orderCode + " | " + customer;
  let price = arrSecret.secretAmountDecode;

  if ( req.body.customerId ) {
    description += " " + req.body.customerId
  }

  console.log('this',arrSecret.secretAmountDecode);

  // 
  try{
  const charge = await stripe.charges.create({
    amount: (price * 100),
    currency: 'usd',
    source: req.body.stripeToken,
    description: description,
    // customer: customer,
    metadata : {
      'customer': "" + customer,
      'description': "" + description,
      'customerName' : req.body.name,
      'customerAddress' : req.body.address
    },
    receipt_email: customer
  });

  if ( charge.paid ) {

    // save
    

    let order = {
      orderNumber: orderCode,
      charge: charge,
      custom: true,
      paid: true,
      action: req.body.code,
      userId: req.body.customerId,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }

    // console.log('put', order);

    order.custEmail = customer;

    mailService.sendOrderNotification(order);
    rpoOrder.put(order);
    res.flash('success', 'Payment Successful!');
    rpoCharge.put(charge);

    activityService.logger(req.ip, req.originalUrl, "Checkout " + req.params.serviceCode, req);

    res.redirect("/thank-you/"+orderCode); 
  } else {
    res.flash('error', 'Sorry!, Something went wrong, try again later.');
    res.redirect("/checkout/" + req.body.code); 
    // return with error
  }

} catch (err) {
  res.flash('error', err.error);
  console.log("errors",err);
  console.log("errors message",err.message);
}

}

exports.generateService = async function(req, res, next) {

  // res.locals = {
  //   siteTitle: "Trademark Search",
  //   description: "Check trademark status",
  //   keywords: "Trademark Status, trademarkers status",
  // };

  res.render(
    "trademark-order/add-service", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    user: await helpers.getLoginUser(req)
  });
}

exports.generateServiceSubmit = async function(req, res, next) {

  // console.log('a');
  try {
   
    let code = '';
    let flag = true;
    
    // FETCH/GENERATE UNIQUE CODE
    for( ; flag;  ) {
      console.log('loop');
      code = helpers.makeid(4) + '-' + helpers.makeid(2);
      let serviceCode = await rpoServiceAction.findByCode(code);
      console.log(serviceCode);
      if (serviceCode.length <= 0) {
        flag = false;
      }

    }
    // console.log('loop end', code);
    let data = {
      code: code,
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount
    }

    let serviceAction = await rpoServiceAction.put(data)

    // send email for notification

    if (serviceAction) {

      mailService.newServiceOrder(data);

      res.flash('success', 'Added new code, [' + code +']');
    } else {
      res.flash('error', 'Sorry, Something went wrong, please try again later.');
    }

  } catch(err) {
    res.flash('error', err.error);
  }
  
  res.redirect("/add-service-code-secret-132321"); 
 
}

// CUSTOM PAGE SERVICE -------------------------------- END

exports.searchSerial = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  res.render("public/search", { 
    layout  : "layouts/public-layout-interactive", 
    title   : ""
  });

}

exports.searchSerialNumber = async function(req, res, next) {

  console.log(req.body);

  res.redirect("/us/"+ req.body.case_number);
}

exports.thankYou = async function(req, res, next) {

  console.log(req.params);

  let order = await rpoOrder.findOrderNumber(req.params.number)

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };

  title = "Thank You!"
  layout = 'layouts/public-layout-interactive'
  render = 'trademark-order/thankyou'
      

  res.render(render, { 
    layout  : layout, 
    title   : title,
    order   : order[0]
  });
}

exports.oppositionProof = async function(req, res, next) {

  res.locals = {
    siteTitle: "Trademark Search",
    description: "Check trademark status",
    keywords: "Trademark Status, trademarkers status",
  };
  
  res.render("public/opposition-proof-of-use", { 
    layout  : "layouts/public-layout-interactive", 
    title   : "",
    user: await helpers.getLoginUser(req)
  });
}


// CUSTOM API
exports.checkTMApi = async function(req, res, next) {
  
  let serial = ''
  if (req.params) {
    serial = req.params.serialNumber
  }


  await crawlerService.fetchTsdr(req.params.serialNumber)

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  let trademark  = await rpoTrademarksMongo.getBySerial(req.params.serialNumber)

  if (!trademark.length) {
    trademark = await rpoTrademarksMongo.getByReg(req.params.serialNumber)
  }
  
  if (trademark.length > 0) {

    

    res.json({
      mark: trademark[0].mark,
      ownerName: trademark[0].ownerName,
      ownerAddress: trademark[0].ownerAddress,
      ownerStreet: trademark[0].ownerStreet,
      ownerProvince: trademark[0].ownerProvince,
      ownerState: trademark[0].ownerState,
      ownerCountry: trademark[0].ownerCountry,
      ownerPostalCode: trademark[0].ownerPostalCode,
      legalEntityType: trademark[0].legalEntityType
    });

  } else {

    // add to trademarks
    // let data = {
    //   serialNumber: req.params.serialNumber
    // }
    // rpoTrademarksMongo.put(data);
    res.json({
      response:"ok"
    });

  }
}

exports.assignment = async function(req, res, next) {

  // res.locals = {
  //   siteTitle: "Trademark Search",
  //   description: "Check trademark status",
  //   keywords: "Trademark Status, trademarkers status",
  // };
  
  res.render("assignment", { 
    layout  : "layouts/public-layout-assignment", 
    title   : ""
  });
}

exports.invoicePdf = async function(req, res, next) {

  console.log('pdf viewer', req.params.orderNo);

  let orders = await rpoOrder.findOrderNumber(req.params.orderNo);
  // let users = await rpoUserMongo.getByIdM(orders[0].userId);

  if (orders[0] && orders[0].charge.order_id) {

    await pdfService.generateOldInvoice(req.params.orderNo);
  } else if ( orders[0] && orders[0].cartItems ) {
    await pdfService.generateInvoice(req.params.orderNo);
  } else {
    await pdfService.generateCustomInvoice(req.params.orderNo);
    // return false
  }

  
  res.redirect("/pdf/" + req.params.orderNo.toLowerCase() + ".pdf")

}




// ======================================== function 
async function isEmailValid(email) {
  return emailValidator.validate(email)
 }


