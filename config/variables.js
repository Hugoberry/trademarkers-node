
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
    ipAddresses     : ['103.104.17','211.20.18','211.72.53','122.116.227','122.52.119','61.244.218','50.74.20','127.0.0','::1'],
    secretAmount    : {
                        'a': 1,
                        'b': 2,
                        'c': 3,
                        'd': 4,
                        'e': 5,
                        'f': 6,
                        'g': 7,
                        'h': 8,
                        'i': 9,
                        'x': 0,
                        '1': 'Statement of Use',
                        '2': 'Extension for Trademark Allowance',
                        '3': 'Trademark Registration',
                        '4': 'Trademark Study'
                      },
    
};
