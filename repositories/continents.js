// DATABASE CONNECTION
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    getContinents: function( id ) {
        
        return connection.query('SELECT * FROM continents', function(error, results, fields) {
			
			return results;
		});

		// return res;
    
    }
};