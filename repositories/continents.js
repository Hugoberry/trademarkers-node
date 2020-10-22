// DATABASE CONNECTION
var db = require('../config/database');

// console.log("host", process.env.DBHOST);
module.exports = {

    getContinents: function( id ) {


        return  db.query('SELECT * FROM continents', function(error, results, fields) {
                
                return results;
            });


    
    }
};