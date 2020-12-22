
var ENV = process.env.ENVIRONMENT || 'prod';

module.exports = { 
    mongoURL        : (ENV === 'prod' ? process.env.MongoURI : process.env.MongoURILOCAL),
    mongoOptions    : { 
                        useNewUrlParser: true, 
                        useUnifiedTopology: true 
                      },
    mongoDB         : 'bigfoot',
    filePathUpload  : (ENV === 'prod' ? process.env.uploadFilePath : process.env.uploadFilePathDev),

    domainTLD       : [{name: 'com'}],
    emailGen        : [{name: 'webmaster'}, {name: 'info'}, {name: 'legal'}, {name: 'contact'}],
    
};