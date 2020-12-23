
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
    ipAddresses     : ['103.104.17','211.20.18','211.72.53','122.116.227','122.52.119','61.244.218','50.74.20']
    
};
