
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
    ipAddresses     : [
                        {
                          ip      : '103.104.17.226/32',
                          office  : 'cebu - rise'
                        },
                        {
                          ip      : '211.20.18.1/24',
                          office  : 'office8'
                        },
                        {
                          ip      : '211.72.53.1/24',
                          office  : 'office10'
                        },
                        {
                          ip      : '122.116.227.21/32',
                          office  : 'office7'
                        },
                        {
                          ip      : '122.52.119.55/32',
                          office  : 'cebu - pldt'
                        },
                        {
                          ip      : '61.244.218.2/32',
                          office  : 'HK Blade'
                        },
                        {
                          ip      : '50.74.20.102/32',
                          office  : '246 w nyc'
                        },

                      ]
    
};
